
import React, { useState, useMemo } from 'react';
import { useTrip } from '../context/TripContext';
import { LuggageCategory, LuggageItem } from '../types';
import { LUGGAGE_CATEGORIES } from '../constants';
import { Plus, Trash2, Edit, Search, X } from 'lucide-react';

const LuggagePage = () => {
    const { trip, dispatch } = useTrip();
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<LuggageItem | null>(null);

    const filteredLuggage = useMemo(() => {
        return trip.luggage.filter(item =>
            item.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [trip.luggage, searchTerm]);

    const groupedLuggage = useMemo(() => {
        const groups: { [key in LuggageCategory]?: LuggageItem[] } = {};
        for (const category of LUGGAGE_CATEGORIES) {
            const items = filteredLuggage.filter(item => item.category === category);
            if (items.length > 0) {
                groups[category] = items;
            }
        }
        return groups;
    }, [filteredLuggage]);

    const handleTogglePacked = (item: LuggageItem) => {
        dispatch({ type: 'UPDATE_LUGGAGE', payload: { ...item, packed: !item.packed } });
    };

    const handleEdit = (item: LuggageItem) => {
        setEditingItem(item);
        setIsModalOpen(true);
    };

    const handleDelete = (id: string) => {
        if(window.confirm('Are you sure you want to delete this item?')) {
            dispatch({ type: 'REMOVE_LUGGAGE', payload: id });
        }
    };

    const openAddNewModal = () => {
        setEditingItem(null);
        setIsModalOpen(true);
    };
    
    const packingProgress = useMemo(() => {
        const totalItems = trip.luggage.length;
        if (totalItems === 0) return 0;
        const packedItems = trip.luggage.filter(item => item.packed).length;
        return Math.round((packedItems / totalItems) * 100);
    }, [trip.luggage]);

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold">Luggage Tracker</h1>
                <button onClick={openAddNewModal} className="bg-primary-600 text-white px-4 py-2 rounded-lg flex items-center shadow-md hover:bg-primary-700">
                    <Plus className="h-5 w-5 mr-2" /> Add Item
                </button>
            </div>
            
            <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-md">
                 <h2 className="text-lg font-semibold mb-2">Packing Progress</h2>
                 <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4">
                     <div className="bg-green-500 h-4 rounded-full" style={{ width: `${packingProgress}%` }}></div>
                 </div>
                 <p className="text-right text-sm mt-1">{packingProgress}% Complete</p>
            </div>

            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                    type="text"
                    placeholder="Search for an item..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                />
            </div>

            {Object.keys(groupedLuggage).length > 0 ? (
                 Object.entries(groupedLuggage).map(([category, items]) => (
                    <div key={category} className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-md">
                        <h2 className="text-xl font-semibold mb-3 border-b pb-2 border-gray-200 dark:border-gray-700">{category}</h2>
                        <ul className="space-y-2">
                            {/* FIX: Use optional chaining because TypeScript infers `items` can be undefined. */}
                            {items?.map(item => (
                                <li key={item.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
                                    <div className="flex items-center">
                                        <input
                                            type="checkbox"
                                            checked={item.packed}
                                            onChange={() => handleTogglePacked(item)}
                                            className="h-5 w-5 rounded text-primary-600 focus:ring-primary-500 border-gray-300"
                                        />
                                        <span className={`ml-3 ${item.packed ? 'line-through text-gray-500' : ''}`}>{item.name}</span>
                                    </div>
                                    <div className="flex items-center space-x-3">
                                        <span className="text-sm text-gray-400">{trip.members.find(m => m.id === item.addedBy)?.name}</span>
                                        <button onClick={() => handleEdit(item)} className="text-gray-400 hover:text-primary-500"><Edit className="h-4 w-4" /></button>
                                        <button onClick={() => handleDelete(item.id)} className="text-gray-400 hover:text-red-500"><Trash2 className="h-4 w-4" /></button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                 ))
            ) : (
                <div className="text-center py-10 bg-white dark:bg-gray-800 rounded-lg shadow-md">
                    <p className="text-gray-500">No luggage items found. Add one to get started!</p>
                </div>
            )}
            
            {isModalOpen && <LuggageModal item={editingItem} onClose={() => setIsModalOpen(false)} />}
        </div>
    );
};

const LuggageModal: React.FC<{ item: LuggageItem | null, onClose: () => void }> = ({ item, onClose }) => {
    const { trip, dispatch } = useTrip();
    const [name, setName] = useState(item?.name || '');
    const [category, setCategory] = useState<LuggageCategory>(item?.category || LuggageCategory.Misc);
    const [addedBy, setAddedBy] = useState(item?.addedBy || trip.members[0].id);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) return;

        const luggageData = {
            id: item?.id || `luggage_${Date.now()}`,
            name,
            category,
            packed: item?.packed || false,
            addedBy,
        };

        if (item) {
            dispatch({ type: 'UPDATE_LUGGAGE', payload: luggageData });
        } else {
            dispatch({ type: 'ADD_LUGGAGE', payload: luggageData });
        }
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md m-4">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold">{item ? 'Edit Item' : 'Add New Item'}</h2>
                    <button onClick={onClose}><X className="h-6 w-6" /></button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Item Name</label>
                        <input type="text" id="name" value={name} onChange={e => setName(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 shadow-sm focus:border-primary-500 focus:ring-primary-500" required />
                    </div>
                    <div>
                        <label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Category</label>
                        <select id="category" value={category} onChange={e => setCategory(e.target.value as LuggageCategory)} className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 shadow-sm focus:border-primary-500 focus:ring-primary-500">
                            {LUGGAGE_CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="addedBy" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Added By</label>
                        <select id="addedBy" value={addedBy} onChange={e => setAddedBy(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 shadow-sm focus:border-primary-500 focus:ring-primary-500">
                            {trip.members.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                        </select>
                    </div>
                    <div className="flex justify-end space-x-3 pt-2">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 dark:bg-gray-600 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500">Cancel</button>
                        <button type="submit" className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700">{item ? 'Save Changes' : 'Add Item'}</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default LuggagePage;