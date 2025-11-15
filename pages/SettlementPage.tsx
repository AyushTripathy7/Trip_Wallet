
import React, { useMemo } from 'react';
import { useTrip } from '../context/TripContext';
import { calculateSettlements } from '../utils/settlement';
import { Share2 } from 'lucide-react';

const SettlementPage = () => {
    const { trip, memberContributions, memberExpenses, totalExpenses } = useTrip();
    const settlements = useMemo(() => {
        return calculateSettlements(trip, totalExpenses, memberContributions, memberExpenses);
    }, [trip, totalExpenses, memberContributions, memberExpenses]);

    const formatCurrency = (amount: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);

    const handleShare = () => {
        let shareText = `*Trip Settlement for ${trip.name}*\n\n`;
        if (settlements.length > 0) {
            settlements.forEach(s => {
                shareText += `${s.from} owes ${s.to} ${formatCurrency(s.amount)}\n`;
            });
        } else {
            shareText += "Everyone is settled up!";
        }
        
        if (navigator.share) {
            navigator.share({
                title: 'Trip Settlement Summary',
                text: shareText,
            });
        } else {
            navigator.clipboard.writeText(shareText);
            alert('Settlement summary copied to clipboard!');
        }
    };
    
    const memberBalances = useMemo(() => {
        const share = trip.members.length > 0 ? totalExpenses / trip.members.length : 0;
        return trip.members.map(member => {
            const contributed = memberContributions.get(member.id) || 0;
            const balance = contributed - share;
            return {
                name: member.name,
                contributed,
                balance
            };
        });
    }, [trip, totalExpenses, memberContributions]);

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold">Settlement</h1>
                <button onClick={handleShare} className="bg-green-500 text-white px-4 py-2 rounded-lg flex items-center shadow-md hover:bg-green-600">
                    <Share2 className="h-5 w-5 mr-2" /> Share
                </button>
            </div>
            
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md">
                 <h2 className="text-xl font-semibold mb-4">Summary per Member</h2>
                 <p className="text-gray-600 dark:text-gray-400 mb-4">
                    Total trip expenses were {formatCurrency(totalExpenses)}. With {trip.members.length} members, the equal share is {formatCurrency(trip.members.length > 0 ? totalExpenses / trip.members.length : 0)}.
                 </p>
                 <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b dark:border-gray-700">
                                <th className="py-2">Member</th>
                                <th className="py-2">Contributed</th>
                                <th className="py-2">Balance</th>
                            </tr>
                        </thead>
                        <tbody>
                            {memberBalances.map(mb => (
                                <tr key={mb.name}>
                                    <td className="py-2">{mb.name}</td>
                                    <td className="py-2">{formatCurrency(mb.contributed)}</td>
                                    <td className={`py-2 font-semibold ${mb.balance >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                                        {mb.balance >= 0 ? `+${formatCurrency(mb.balance)}` : `-${formatCurrency(Math.abs(mb.balance))}`}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                 </div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md">
                <h2 className="text-xl font-semibold mb-4">Who Owes Whom?</h2>
                {settlements.length > 0 ? (
                    <ul className="space-y-3">
                        {settlements.map((s, index) => (
                            <li key={index} className="flex items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                <span className="font-semibold text-primary-600 dark:text-primary-400">{s.from}</span>
                                <span className="mx-2 text-gray-500">owes</span>
                                <span className="font-semibold text-green-500">{s.to}</span>
                                <span className="ml-auto font-bold text-lg">{formatCurrency(s.amount)}</span>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-center py-4 text-gray-500">Everyone is settled up. No payments needed!</p>
                )}
            </div>
        </div>
    );
};

export default SettlementPage;
