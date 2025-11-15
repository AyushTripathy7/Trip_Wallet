
import React, { useState } from 'react';
import { HashRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import { TripProvider } from './context/TripContext';
import { Home, Briefcase, DollarSign, BarChart, Users, FileDown, Bot, Settings } from 'lucide-react';

// Pages - defined in this file to reduce file count
import DashboardPage from './pages/DashboardPage';
import LuggagePage from './pages/LuggagePage';
import ExpensesPage from './pages/ExpensesPage';
import AnalyticsPage from './pages/AnalyticsPage';
import SettlementPage from './pages/SettlementPage';
import SettingsPage from './pages/SettingsPage';
import AIAssistant from './components/ai/AIAssistant';


const navItems = [
  { path: '/', label: 'Home', icon: Home },
  { path: '/luggage', label: 'Luggage', icon: Briefcase },
  { path: '/expenses', label: 'Expenses', icon: DollarSign },
  { path: '/analytics', label: 'Analytics', icon: BarChart },
  { path: '/settlement', label: 'Settlement', icon: Users },
];

const BottomNav = () => {
  const location = useLocation();
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 shadow-t-lg border-t border-gray-200 dark:border-gray-700 md:hidden">
      <div className="flex justify-around max-w-lg mx-auto">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center justify-center w-full pt-2 pb-1 text-sm ${
                isActive ? 'text-primary-600 dark:text-primary-400' : 'text-gray-500 dark:text-gray-400'
              }`}
            >
              <item.icon className="w-6 h-6 mb-1" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

const App = () => {
  const [isAiAssistantOpen, setAiAssistantOpen] = useState(false);

  return (
    <TripProvider>
      <HashRouter>
        <div className="bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 min-h-screen font-sans flex">
          {/* Sidebar for Desktop */}
          <aside className="hidden md:flex md:flex-col md:w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700">
             <div className="flex items-center justify-center h-16 border-b border-gray-200 dark:border-gray-700">
                <FileDown className="h-8 w-8 text-primary-600" />
                <span className="text-xl font-bold ml-2">Trip Mate</span>
             </div>
             <nav className="flex-1 px-2 py-4 space-y-2">
                 {navItems.map((item) => <NavItem key={item.path} item={item} />)}
                 <hr className="my-2 border-gray-200 dark:border-gray-700" />
                 <NavItem item={{path: '/settings', label: 'Settings', icon: Settings}}/>
             </nav>
          </aside>
          
          <main className="flex-1 pb-20 md:pb-0">
             <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <Routes>
                  <Route path="/" element={<DashboardPage />} />
                  <Route path="/luggage" element={<LuggagePage />} />
                  <Route path="/expenses" element={<ExpensesPage />} />
                  <Route path="/analytics" element={<AnalyticsPage />} />
                  <Route path="/settlement" element={<SettlementPage />} />
                  <Route path="/settings" element={<SettingsPage />} />
                </Routes>
             </div>
          </main>
          
          <BottomNav />
          <button
            onClick={() => setAiAssistantOpen(true)}
            className="fixed bottom-24 md:bottom-8 right-8 bg-primary-600 text-white p-4 rounded-full shadow-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 z-50 transition-transform transform hover:scale-110"
            aria-label="Open AI Assistant"
          >
            <Bot className="h-6 w-6" />
          </button>
          <AIAssistant isOpen={isAiAssistantOpen} onClose={() => setAiAssistantOpen(false)} />
        </div>
      </HashRouter>
    </TripProvider>
  );
};

const NavItem: React.FC<{item: {path:string, label:string, icon: React.ElementType}}> = ({item}) => {
    const location = useLocation();
    const isActive = location.pathname === item.path;
    return (
         <Link
            to={item.path}
            className={`flex items-center px-4 py-2 text-base rounded-lg ${
              isActive ? 'bg-primary-100 dark:bg-primary-900 text-primary-600 dark:text-primary-200' : 'hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            <item.icon className="w-6 h-6 mr-3" />
            {item.label}
          </Link>
    );
};


export default App;
