
import React, { useState, useMemo } from 'react';
import { useTrip } from '../context/TripContext';
import { Expense, ExpenseCategory } from '../types';
import { EXPENSE_CATEGORIES } from '../constants';
import { Plus, Trash2, Edit, Camera, X, Loader } from 'lucide-react';
import { scanReceipt } from '../services/geminiService';

const ExpensesPage = () => {
    const { trip, dispatch, totalContributions, totalExpenses, balance } = useTrip();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingExpense, setEditingExpense] = useState<Expense | null>(null);

    const sortedExpenses = useMemo(() => {
        return [...trip.expenses].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [trip.expenses]);
    
    const handleEdit = (expense: Expense) => {
        setEditingExpense(expense);
        setIsModalOpen(true);
    };

    const handleDelete = (id: string) => {
        if(window.confirm('Are you sure you want to delete this expense?')) {
            dispatch({ type: 'REMOVE_EXPENSE', payload: id });
        }
    };

    const openAddNewModal = () => {
        setEditingExpense(null);
        setIsModalOpen(true);
    };

    const formatCurrency = (amount: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
    const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString();
    
    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold">Expense Manager</h1>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <StatCard title="Total Collected" value={formatCurrency(totalContributions)} color="text-green-500" />
                <StatCard title="Total Spent" value={formatCurrency(totalExpenses)} color="text-red-500" />
                <StatCard title="Remaining" value={formatCurrency(balance)} color={balance >= 0 ? "text-blue-500" : "text-yellow-500"} />
            </div>

            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-semibold">Transactions</h2>
                 <button onClick={openAddNewModal} className="bg-primary-600 text-white px-4 py-2 rounded-lg flex items-center shadow-md hover:bg-primary-700">
                    <Plus className="h-5 w-5 mr-2" /> Add Expense
                </button>
            </div>

            <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-md">
                <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                    {sortedExpenses.length > 0 ? sortedExpenses.map(expense => (
                        <li key={expense.id} className="py-3 flex justify-between items-center">
                            <div>
                                <p className="font-semibold text-lg">{expense.title}</p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">{expense.category} &bull; {formatDate(expense.date)} &bull; Paid by {trip.members.find(m => m.id === expense.paidBy)?.name}</p>
                            </div>
                            <div className="flex items-center space-x-4">
                               <p className="font-bold text-lg">{formatCurrency(expense.amount)}</p>
                               <div className="flex items-center space-x-2">
                                   <button onClick={() => handleEdit(expense)} className="text-gray-400 hover:text-primary-500"><Edit className="h-4 w-4" /></button>
                                   <button onClick={() => handleDelete(expense.id)} className="text-gray-400 hover:text-red-500"><Trash2 className="h-4 w-4" /></button>
                               </div>
                            </div>
                        </li>
                    )) : (
                        <p className="text-center py-4 text-gray-500">No expenses recorded yet.</p>
                    )}
                </ul>
            </div>
            {isModalOpen && <ExpenseModal expense={editingExpense} onClose={() => setIsModalOpen(false)} />}
        </div>
    );
};

const StatCard: React.FC<{ title: string; value: string; color: string }> = ({ title, value, color }) => (
  <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-md">
    <h4 className="text-sm text-gray-500 dark:text-gray-400 font-medium">{title}</h4>
    <p className={`text-2xl font-bold ${color}`}>{value}</p>
  </div>
);

const ExpenseModal: React.FC<{ expense: Expense | null, onClose: () => void }> = ({ expense, onClose }) => {
    const { trip, dispatch } = useTrip();
    const [title, setTitle] = useState(expense?.title || '');
    const [amount, setAmount] = useState<string>(expense?.amount.toString() || '');
    const [category, setCategory] = useState<ExpenseCategory>(expense?.category || ExpenseCategory.Misc);
    const [date, setDate] = useState(expense?.date ? expense.date.split('T')[0] : new Date().toISOString().split('T')[0]);
    const [paidBy, setPaidBy] = useState(expense?.paidBy || trip.members[0].id);
    const [notes, setNotes] = useState(expense?.notes || '');
    const [isScanning, setIsScanning] = useState(false);
    const [scanError, setScanError] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const numAmount = parseFloat(amount);
        if (!title.trim() || isNaN(numAmount) || numAmount <= 0) return;

        const expenseData = {
            id: expense?.id || `expense_${Date.now()}`,
            title,
            amount: numAmount,
            category,
            date: new Date(date).toISOString(),
            paidBy,
            notes,
        };

        if (expense) {
            dispatch({ type: 'UPDATE_EXPENSE', payload: expenseData });
        } else {
            dispatch({ type: 'ADD_EXPENSE', payload: expenseData });
        }
        onClose();
    };
    
    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsScanning(true);
        setScanError('');
        try {
            const result = await scanReceipt(file);
            if (result.title) setTitle(result.title);
            if (result.amount) setAmount(result.amount.toString());
            if (result.date) setDate(result.date);
            // Auto-suggest category can be an AI feature
        } catch (error) {
            console.error('OCR failed:', error);
            setScanError('Could not read receipt. Please enter manually.');
        } finally {
            setIsScanning(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-lg m-4">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold">{expense ? 'Edit Expense' : 'Add New Expense'}</h2>
                    <button onClick={onClose}><X className="h-6 w-6" /></button>
                </div>
                
                <div className="mb-4">
                    <label htmlFor="receipt-upload" className="w-full cursor-pointer bg-blue-50 dark:bg-blue-900/50 border-2 border-dashed border-blue-300 dark:border-blue-700 rounded-lg p-4 text-center text-blue-600 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/80">
                         {isScanning ? (
                            <div className="flex items-center justify-center">
                                <Loader className="h-5 w-5 mr-2 animate-spin" />
                                <span>Scanning...</span>
                            </div>
                         ) : (
                             <div className="flex items-center justify-center">
                                <Camera className="h-5 w-5 mr-2" />
                                <span>Scan a Receipt (Optional)</span>
                             </div>
                         )}
                    </label>
                    <input id="receipt-upload" type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                    {scanError && <p className="text-red-500 text-sm mt-1">{scanError}</p>}
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="title" className="block text-sm font-medium">Title</label>
                            <input type="text" id="title" value={title} onChange={e => setTitle(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 shadow-sm focus:border-primary-500 focus:ring-primary-500" required />
                        </div>
                        <div>
                            <label htmlFor="amount" className="block text-sm font-medium">Amount</label>
                            <input type="number" id="amount" value={amount} onChange={e => setAmount(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 shadow-sm focus:border-primary-500 focus:ring-primary-500" required step="0.01" />
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="category" className="block text-sm font-medium">Category</label>
                            <select id="category" value={category} onChange={e => setCategory(e.target.value as ExpenseCategory)} className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 shadow-sm focus:border-primary-500 focus:ring-primary-500">
                                {EXPENSE_CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                            </select>
                        </div>
                         <div>
                            <label htmlFor="date" className="block text-sm font-medium">Date</label>
                            <input type="date" id="date" value={date} onChange={e => setDate(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 shadow-sm focus:border-primary-500 focus:ring-primary-500" required />
                        </div>
                    </div>
                     <div>
                        <label htmlFor="paidBy" className="block text-sm font-medium">Paid By</label>
                        <select id="paidBy" value={paidBy} onChange={e => setPaidBy(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 shadow-sm focus:border-primary-500 focus:ring-primary-500">
                            {trip.members.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="notes" className="block text-sm font-medium">Notes (Optional)</label>
                        <textarea id="notes" value={notes} onChange={e => setNotes(e.target.value)} rows={3} className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 shadow-sm focus:border-primary-500 focus:ring-primary-500"></textarea>
                    </div>
                    <div className="flex justify-end space-x-3 pt-2">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 dark:bg-gray-600 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500">Cancel</button>
                        <button type="submit" className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700">{expense ? 'Save Changes' : 'Add Expense'}</button>
                    </div>
                </form>
            </div>
        </div>
    );
};


export default ExpensesPage;
