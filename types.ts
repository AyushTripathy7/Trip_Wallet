
import React from 'react';

export enum LuggageCategory {
  Clothes = 'Clothes',
  Toiletries = 'Toiletries',
  Documents = 'Documents',
  Gadgets = 'Gadgets',
  Misc = 'Misc',
}

export enum ExpenseCategory {
  Food = 'Food',
  Hotel = 'Hotel',
  Travel = 'Travel',
  Shopping = 'Shopping',
  Activities = 'Activities',
  Misc = 'Misc',
}

export interface Member {
  id: string;
  name: string;
}

export interface LuggageItem {
  id: string;
  name: string;
  category: LuggageCategory;
  packed: boolean;
  addedBy: string; // Member ID
}

export interface Expense {
  id: string;
  title: string;
  amount: number;
  category: ExpenseCategory;
  date: string; // ISO string
  notes?: string;
  paidBy: string; // Member ID
}

export interface Contribution {
  id: string;
  memberId: string;
  amount: number;
}

export interface Trip {
  id: string;
  name: string;
  members: Member[];
  luggage: LuggageItem[];
  expenses: Expense[];
  contributions: Contribution[];
}

export type Action =
  | { type: 'SET_TRIP'; payload: Trip }
  | { type: 'UPDATE_TRIP_NAME'; payload: string }
  | { type: 'ADD_MEMBER'; payload: Member }
  | { type: 'REMOVE_MEMBER'; payload: string } // memberId
  | { type: 'ADD_LUGGAGE'; payload: LuggageItem }
  | { type: 'UPDATE_LUGGAGE'; payload: LuggageItem }
  | { type: 'REMOVE_LUGGAGE'; payload: string } // luggageId
  | { type: 'ADD_EXPENSE'; payload: Expense }
  | { type: 'UPDATE_EXPENSE'; payload: Expense }
  | { type: 'REMOVE_EXPENSE'; payload: string } // expenseId
  | { type: 'ADD_CONTRIBUTION'; payload: { memberId: string; amount: number } }
  | { type: 'SET_STATE'; payload: Trip };

export interface TripContextType {
  trip: Trip;
  dispatch: React.Dispatch<Action>;
  totalContributions: number;
  totalExpenses: number;
  balance: number;
  memberContributions: Map<string, number>;
  memberExpenses: Map<string, number>;
}

export interface Settlement {
  from: string; // Member name
  to: string; // Member name
  amount: number;
}