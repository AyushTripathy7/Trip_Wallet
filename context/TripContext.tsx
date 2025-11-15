
import React, { createContext, useReducer, useEffect, useMemo, useContext } from 'react';
import { Trip, Action, TripContextType, Contribution } from '../types';
import { useLocalStorage } from '../hooks/useLocalStorage';

const initialState: Trip = {
  id: `trip_${Date.now()}`,
  name: 'My Awesome Trip',
  members: [{ id: 'user_1', name: 'Me' }],
  luggage: [],
  expenses: [],
  contributions: [{ id: `contr_1`, memberId: 'user_1', amount: 500 }],
};

const tripReducer = (state: Trip, action: Action): Trip => {
  switch (action.type) {
    case 'SET_STATE':
      return action.payload;
    case 'UPDATE_TRIP_NAME':
      return { ...state, name: action.payload };
    case 'ADD_MEMBER':
      if (state.members.find(m => m.name.toLowerCase() === action.payload.name.toLowerCase())) return state;
      return { ...state, members: [...state.members, action.payload] };
    case 'REMOVE_MEMBER':
      // This is a complex action, ideally we'd re-assign expenses/luggage. For now, we just remove.
      return { ...state, members: state.members.filter(m => m.id !== action.payload) };
    case 'ADD_LUGGAGE':
      return { ...state, luggage: [...state.luggage, action.payload] };
    case 'UPDATE_LUGGAGE':
      return {
        ...state,
        luggage: state.luggage.map(item => item.id === action.payload.id ? action.payload : item),
      };
    case 'REMOVE_LUGGAGE':
      return { ...state, luggage: state.luggage.filter(item => item.id !== action.payload) };
    case 'ADD_EXPENSE':
      return { ...state, expenses: [...state.expenses, action.payload] };
    case 'UPDATE_EXPENSE':
       return {
        ...state,
        expenses: state.expenses.map(item => item.id === action.payload.id ? action.payload : item),
      };
    case 'REMOVE_EXPENSE':
      return { ...state, expenses: state.expenses.filter(item => item.id !== action.payload) };
    case 'ADD_CONTRIBUTION':
      {
        const existingContributionIndex = state.contributions.findIndex(c => c.memberId === action.payload.memberId);
        let newContributions: Contribution[];

        if(existingContributionIndex > -1) {
          newContributions = [...state.contributions];
          newContributions[existingContributionIndex] = {
            ...newContributions[existingContributionIndex],
            amount: newContributions[existingContributionIndex].amount + action.payload.amount
          };
        } else {
            newContributions = [...state.contributions, {id: `contr_${Date.now()}`, ...action.payload }];
        }
        return { ...state, contributions: newContributions };
      }
    default:
      return state;
  }
};

export const TripContext = createContext<TripContextType | undefined>(undefined);

export const TripProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [storedTrip, setStoredTrip] = useLocalStorage<Trip>('tripData', initialState);
  const [trip, dispatch] = useReducer(tripReducer, storedTrip);

  useEffect(() => {
    setStoredTrip(trip);
  }, [trip, setStoredTrip]);
  
  // This effect listens to local storage changes from other tabs
  useEffect(() => {
    dispatch({ type: 'SET_STATE', payload: storedTrip });
  }, [storedTrip]);

  const { totalContributions, totalExpenses, balance, memberContributions, memberExpenses } = useMemo(() => {
    const totalContributions = trip.contributions.reduce((sum, c) => sum + c.amount, 0);
    const totalExpenses = trip.expenses.reduce((sum, e) => sum + e.amount, 0);
    const balance = totalContributions - totalExpenses;
    
    const memberContributions = new Map<string, number>();
    trip.contributions.forEach(c => {
        memberContributions.set(c.memberId, (memberContributions.get(c.memberId) || 0) + c.amount);
    });

    const memberExpenses = new Map<string, number>();
    trip.expenses.forEach(e => {
        memberExpenses.set(e.paidBy, (memberExpenses.get(e.paidBy) || 0) + e.amount);
    });

    return { totalContributions, totalExpenses, balance, memberContributions, memberExpenses };
  }, [trip]);

  const value = { trip, dispatch, totalContributions, totalExpenses, balance, memberContributions, memberExpenses };

  return (
    <TripContext.Provider value={value}>
      {children}
    </TripContext.Provider>
  );
};

export const useTrip = (): TripContextType => {
  const context = useContext(TripContext);
  if (context === undefined) {
    throw new Error('useTrip must be used within a TripProvider');
  }
  return context;
};
