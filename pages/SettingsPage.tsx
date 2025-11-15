
import React, { useState } from 'react';
import { useTrip } from '../context/TripContext';
import { Plus, Trash2, Save } from 'lucide-react';
import { Trip } from '../types';

const SettingsPage = () => {
    const { trip, dispatch, memberContributions } = useTrip();
    const [tripName, setTripName] = useState(trip.name);
    const [newMemberName, setNewMemberName] = useState('');
    const [contributionMember, setContributionMember] = useState(trip.members[0]?.id || '');
    const [contributionAmount, setContributionAmount] = useState('');

    const handleUpdateTripName = () => {
        dispatch({ type: 'UPDATE_TRIP_NAME', payload: tripName });
        alert('Trip name updated!');
    };

    const handleAddMember = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMemberName.trim()) return;
        dispatch({
            type: 'ADD_MEMBER',
            payload: { id: `member_${Date.now()}`, name: newMemberName.trim() }
        });
        setNewMemberName('');
    };

    const handleRemoveMember = (memberId: string) => {
        if (trip.members.length <= 1) {
            alert("You can't remove the last member.");
            return;
        }
        if (window.confirm('Are you sure? Removing a member cannot be undone and may affect settlements.')) {
            dispatch({ type: 'REMOVE_MEMBER', payload: memberId });
        }
    };
    
    const handleAddContribution = (e: React.FormEvent) => {
        e.preventDefault();
        const amount = parseFloat(contributionAmount);
        if (!contributionMember || isNaN(amount) || amount <= 0) return;
        dispatch({ type: 'ADD_CONTRIBUTION', payload: { memberId: contributionMember, amount } });
        setContributionAmount('');
    };
    
    const handleExport = () => {
        const dataStr = JSON.stringify(trip);
        const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
        const exportFileDefaultName = 'trip_data.json';
        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();
    };
    
    const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
        const fileReader = new FileReader();
        if (!event.target.files) return;
        fileReader.readAsText(event.target.files[0], "UTF-8");
        fileReader.onload = e => {
            try {
                const importedTrip: Trip = JSON.parse(e.target?.result as string);
                // Some basic validation
                if (importedTrip.id && importedTrip.name && Array.isArray(importedTrip.members)) {
                     if (window.confirm('This will overwrite all current trip data. Are you sure?')) {
                        dispatch({ type: 'SET_STATE', payload: importedTrip });
                     }
                } else {
                    throw new Error("Invalid trip data file.");
                }
            } catch (error) {
                alert("Failed to import trip data. The file might be corrupted or in the wrong format.");
            }
        };
    };

    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-bold">Trip Settings</h1>

            <SettingsCard title="Trip Name">
                <div className="flex space-x-2">
                    <input
                        type="text"
                        value={tripName}
                        onChange={(e) => setTripName(e.target.value)}
                        className="flex-grow w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-md focus:ring-primary-500 focus:border-primary-500"
                    />
                    <button onClick={handleUpdateTripName} className="bg-primary-600 text-white px-4 py-2 rounded-lg flex items-center shadow-md hover:bg-primary-700">
                        <Save className="h-5 w-5 mr-2" /> Save
                    </button>
                </div>
            </SettingsCard>
            
            <SettingsCard title="Manage Members">
                 <ul className="space-y-2 mb-4">
                    {trip.members.map(member => (
                        <li key={member.id} className="flex justify-between items-center p-2 bg-gray-50 dark:bg-gray-700 rounded-lg">
                            <span>{member.name}</span>
                            <span className="text-sm text-green-600 dark:text-green-400">
                                Contributed: {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(memberContributions.get(member.id) || 0)}
                            </span>
                            <button onClick={() => handleRemoveMember(member.id)} className="text-red-500 hover:text-red-700">
                                <Trash2 className="h-4 w-4" />
                            </button>
                        </li>
                    ))}
                </ul>
                <form onSubmit={handleAddMember} className="flex space-x-2">
                    <input
                        type="text"
                        value={newMemberName}
                        onChange={(e) => setNewMemberName(e.target.value)}
                        placeholder="New member's name"
                        className="flex-grow w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-md focus:ring-primary-500 focus:border-primary-500"
                    />
                    <button type="submit" className="bg-primary-600 text-white px-4 py-2 rounded-lg flex items-center shadow-md hover:bg-primary-700">
                        <Plus className="h-5 w-5 mr-2" /> Add
                    </button>
                </form>
            </SettingsCard>

            <SettingsCard title="Manage Contributions">
                <form onSubmit={handleAddContribution} className="space-y-4">
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="contributionMember" className="block text-sm font-medium">Member</label>
                            <select id="contributionMember" value={contributionMember} onChange={e => setContributionMember(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 shadow-sm focus:border-primary-500 focus:ring-primary-500">
                                {trip.members.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                            </select>
                        </div>
                         <div>
                            <label htmlFor="contributionAmount" className="block text-sm font-medium">Contribution Amount</label>
                            <input type="number" id="contributionAmount" value={contributionAmount} onChange={e => setContributionAmount(e.target.value)} placeholder="e.g., 100" className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 shadow-sm focus:border-primary-500 focus:ring-primary-500" step="1" />
                        </div>
                    </div>
                    <div className="text-right">
                       <button type="submit" className="bg-primary-600 text-white px-4 py-2 rounded-lg flex items-center shadow-md hover:bg-primary-700 ml-auto">
                           <Plus className="h-5 w-5 mr-2" /> Add Contribution
                       </button>
                    </div>
                </form>
            </SettingsCard>
            
            <SettingsCard title="Data Management">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    You can export your current trip data to a file as a backup or to share with another device.
                    Importing a file will overwrite all current data.
                </p>
                <div className="flex space-x-4">
                    <button onClick={handleExport} className="flex-1 bg-blue-500 text-white px-4 py-2 rounded-lg shadow-md hover:bg-blue-600">Export Data</button>
                    <label className="flex-1 bg-green-500 text-white px-4 py-2 rounded-lg shadow-md hover:bg-green-600 cursor-pointer text-center">
                        Import Data
                        <input type='file' onChange={handleImport} className="hidden" accept=".json" />
                    </label>
                </div>
            </SettingsCard>

        </div>
    );
};

const SettingsCard: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md">
        <h2 className="text-xl font-semibold mb-4 border-b pb-2 dark:border-gray-700">{title}</h2>
        {children}
    </div>
);

export default SettingsPage;
