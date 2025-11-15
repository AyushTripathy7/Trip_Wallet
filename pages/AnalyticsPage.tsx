
import React, { useMemo } from 'react';
import { useTrip } from '../context/TripContext';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import { ExpenseCategory } from '../types';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF', '#FF42A1'];

const AnalyticsPage = () => {
    const { trip, totalExpenses } = useTrip();

    const categoryData = useMemo(() => {
        const categoryMap = new Map<ExpenseCategory, number>();
        trip.expenses.forEach(expense => {
            categoryMap.set(expense.category, (categoryMap.get(expense.category) || 0) + expense.amount);
        });
        return Array.from(categoryMap.entries()).map(([name, value]) => ({ name, value }));
    }, [trip.expenses]);

    const dailyData = useMemo(() => {
        const dateMap = new Map<string, number>();
        trip.expenses.forEach(expense => {
            const date = new Date(expense.date).toLocaleDateString();
            dateMap.set(date, (dateMap.get(date) || 0) + expense.amount);
        });
        return Array.from(dateMap.entries()).map(([name, value]) => ({ name, value })).sort((a,b) => new Date(a.name).getTime() - new Date(b.name).getTime());
    }, [trip.expenses]);

    const balanceOverTime = useMemo(() => {
        if (trip.expenses.length === 0) return [];
        const sortedExpenses = [...trip.expenses].sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        let cumulativeExpense = 0;
        const totalContributions = trip.contributions.reduce((sum, c) => sum + c.amount, 0);

        const dataByDate = new Map<string, number>();
        sortedExpenses.forEach(exp => {
            const dateStr = new Date(exp.date).toLocaleDateString();
            dataByDate.set(dateStr, (dataByDate.get(dateStr) || 0) + exp.amount);
        });
        
        const balanceData: {name: string, balance: number}[] = [];
        for (const [date, dailyTotal] of dataByDate.entries()) {
            cumulativeExpense += dailyTotal;
            balanceData.push({ name: date, balance: totalContributions - cumulativeExpense });
        }
        return balanceData.sort((a,b) => new Date(a.name).getTime() - new Date(b.name).getTime());
    }, [trip.expenses, trip.contributions]);

    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-bold">Trip Analytics</h1>

            {trip.expenses.length === 0 ? (
                <div className="text-center py-10 bg-white dark:bg-gray-800 rounded-lg shadow-md">
                    <p className="text-gray-500">No expense data to analyze yet. Add some expenses to see the charts.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <ChartCard title="Expense Breakdown by Category">
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie data={categoryData} cx="50%" cy="50%" labelLine={false} outerRadius={80} fill="#8884d8" dataKey="value" nameKey="name" label={({ cx, cy, midAngle, innerRadius, outerRadius, percent, index }) => {
                                    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
                                    const x = cx + radius * Math.cos(-midAngle * (Math.PI / 180));
                                    const y = cy + radius * Math.sin(-midAngle * (Math.PI / 180));
                                    return (
                                        <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central">
                                            {`${(percent * 100).toFixed(0)}%`}
                                        </text>
                                    );
                                }}>
                                    {categoryData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip formatter={(value: number) => `$${value.toFixed(2)}`} />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </ChartCard>

                    <ChartCard title="Daily Spending">
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={dailyData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip formatter={(value: number) => `$${value.toFixed(2)}`} />
                                <Legend />
                                <Bar dataKey="value" fill="#8884d8" name="Spent" />
                            </BarChart>
                        </ResponsiveContainer>
                    </ChartCard>
                    
                    <ChartCard title="Remaining Balance Over Time" className="lg:col-span-2">
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={balanceOverTime}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip formatter={(value: number) => `$${value.toFixed(2)}`} />
                                <Legend />
                                <Line type="monotone" dataKey="balance" stroke="#82ca9d" name="Balance" />
                            </LineChart>
                        </ResponsiveContainer>
                    </ChartCard>
                </div>
            )}
        </div>
    );
};

const ChartCard: React.FC<{ title: string; children: React.ReactNode, className?: string }> = ({ title, children, className }) => (
    <div className={`bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md ${className}`}>
        <h2 className="text-xl font-semibold mb-4">{title}</h2>
        {children}
    </div>
);

export default AnalyticsPage;
