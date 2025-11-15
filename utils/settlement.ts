
import { Trip, Settlement } from '../types';

export const calculateSettlements = (
    trip: Trip, 
    totalExpenses: number, 
    memberContributions: Map<string, number>,
    memberExpenses: Map<string, number>
): Settlement[] => {
    if (trip.members.length === 0 || totalExpenses === 0) {
        return [];
    }
    
    const balances = new Map<string, number>();
    const perPersonShare = totalExpenses / trip.members.length;

    trip.members.forEach(member => {
        const contributed = memberContributions.get(member.id) || 0;
        const balance = contributed - perPersonShare;
        balances.set(member.id, balance);
    });

    const debtors = new Map<string, number>();
    const creditors = new Map<string, number>();

    balances.forEach((balance, memberId) => {
        if (balance < 0) {
            debtors.set(memberId, -balance);
        } else if (balance > 0) {
            creditors.set(memberId, balance);
        }
    });

    const settlements: Settlement[] = [];
    
    const getMemberName = (id: string) => trip.members.find(m => m.id === id)?.name || 'Unknown';

    for (const [debtorId, debtorAmount] of debtors.entries()) {
        let amountOwed = debtorAmount;
        for (const [creditorId, creditorAmount] of creditors.entries()) {
            if (amountOwed === 0) break;
            if (creditorAmount === 0) continue;

            const payment = Math.min(amountOwed, creditorAmount);
            
            settlements.push({
                from: getMemberName(debtorId),
                to: getMemberName(creditorId),
                amount: payment
            });

            amountOwed -= payment;
            creditors.set(creditorId, creditorAmount - payment);
        }
    }

    return settlements;
};
