
import React from 'react';
import { Link } from 'react-router-dom';
import { Briefcase, DollarSign, BarChart, Users, Settings, Upload, FileDown } from 'lucide-react';
import { useTrip } from '../context/TripContext';
import { generateTripReport } from '../services/pdfService';

const Card: React.FC<{ to: string; title: string; description: string; icon: React.ElementType }> = ({ to, title, description, icon: Icon }) => (
  <Link to={to} className="block bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow transform hover:-translate-y-1">
    <div className="flex items-center mb-4">
      <div className="bg-primary-100 dark:bg-primary-900 p-3 rounded-full">
        <Icon className="h-6 w-6 text-primary-600 dark:text-primary-300" />
      </div>
      <h3 className="ml-4 text-xl font-semibold text-gray-800 dark:text-gray-100">{title}</h3>
    </div>
    <p className="text-gray-600 dark:text-gray-400">{description}</p>
  </Link>
);

const StatCard: React.FC<{ title: string; value: string; color: string }> = ({ title, value, color }) => (
  <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-md">
    <h4 className="text-sm text-gray-500 dark:text-gray-400 font-medium">{title}</h4>
    <p className={`text-2xl font-bold ${color}`}>{value}</p>
  </div>
);

const DashboardPage = () => {
    const { trip, totalContributions, totalExpenses, balance } = useTrip();

    const formatCurrency = (amount: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);

    const handleExportPdf = () => {
      generateTripReport(trip);
    };

    return (
        <div className="space-y-8">
            <header>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Trip Dashboard</h1>
                <p className="text-lg text-gray-500 dark:text-gray-400">Welcome to "{trip.name}"</p>
            </header>

            <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <StatCard title="Total Collected" value={formatCurrency(totalContributions)} color="text-green-500" />
                <StatCard title="Total Spent" value={formatCurrency(totalExpenses)} color="text-red-500" />
                <StatCard title="Remaining Balance" value={formatCurrency(balance)} color={balance >= 0 ? "text-blue-500" : "text-yellow-500"} />
            </section>

            <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card to="/luggage" title="Luggage Tracker" description="Manage your packing list." icon={Briefcase} />
                <Card to="/expenses" title="Expense Manager" description="Track all your spending." icon={DollarSign} />
                <Card to="/analytics" title="Trip Analytics" description="Visualize your expenses." icon={BarChart} />
                <Card to="/settlement" title="Settlement" description="Calculate who owes whom." icon={Users} />
            </section>
            
            <section className="space-y-4">
                 <h2 className="text-2xl font-semibold">Actions</h2>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <button onClick={handleExportPdf} className="flex flex-col items-center justify-center bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow transform hover:-translate-y-1 text-left w-full">
                         <div className="flex items-center w-full">
                            <div className="bg-green-100 dark:bg-green-900 p-3 rounded-full">
                                <FileDown className="h-6 w-6 text-green-600 dark:text-green-300" />
                             </div>
                            <div className="ml-4">
                                <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100">Export PDF Report</h3>
                                <p className="text-gray-600 dark:text-gray-400">Generate a complete trip summary.</p>
                            </div>
                         </div>
                    </button>
                    <Link to="/settings" className="block bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow transform hover:-translate-y-1">
                        <div className="flex items-center">
                            <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded-full">
                                <Settings className="h-6 w-6 text-gray-600 dark:text-gray-300" />
                            </div>
                            <div className="ml-4">
                                <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100">Trip Settings</h3>
                                <p className="text-gray-600 dark:text-gray-400">Manage members and trip details.</p>
                            </div>
                        </div>
                    </Link>
                 </div>
            </section>
        </div>
    );
};

export default DashboardPage;
