import React, { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { FoodItem, Category } from '../types';
import { CATEGORY_COLORS, EXPIRY_WARNING_DAYS, ONE_DAY_MS } from '../constants';

interface DashboardProps {
  items: FoodItem[];
}

const Dashboard: React.FC<DashboardProps> = ({ items }) => {
  const stats = useMemo(() => {
    const now = new Date();
    let expiringSoon = 0;
    let expired = 0;
    const categoryCounts: Record<string, number> = {};

    items.forEach(item => {
      if (item.consumed) return;
      
      const expiry = new Date(item.expiryDate);
      const diffTime = expiry.getTime() - now.getTime();
      const diffDays = Math.ceil(diffTime / ONE_DAY_MS);

      if (diffDays < 0) expired++;
      else if (diffDays <= EXPIRY_WARNING_DAYS) expiringSoon++;

      categoryCounts[item.category] = (categoryCounts[item.category] || 0) + item.quantity;
    });

    const chartData = Object.keys(categoryCounts).map(key => ({
      name: key,
      value: categoryCounts[key]
    }));

    return { expiringSoon, expired, total: items.filter(i => !i.consumed).length, chartData };
  }, [items]);

  return (
    <div className="space-y-6 pb-24">
      <header>
        <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
        <p className="text-gray-500">Welcome back! Here's your pantry status.</p>
      </header>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center justify-center">
            <span className="text-3xl font-bold text-red-500">{stats.expiringSoon}</span>
            <span className="text-xs text-gray-500 text-center mt-1">Expiring Soon</span>
        </div>
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center justify-center">
            <span className="text-3xl font-bold text-gray-800">{stats.total}</span>
            <span className="text-xs text-gray-500 text-center mt-1">Total Items</span>
        </div>
      </div>
      
      {stats.expired > 0 && (
         <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r shadow-sm">
            <div className="flex">
              <div className="flex-shrink-0">
                <i className="fas fa-exclamation-circle text-red-500"></i>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">
                  You have <span className="font-bold">{stats.expired}</span> expired items. 
                  Consider removing them.
                </p>
              </div>
            </div>
          </div>
      )}

      {/* Chart */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Inventory by Category</h3>
        <div className="h-64 w-full">
            {stats.chartData.length > 0 ? (
                 <ResponsiveContainer width="100%" height="100%">
                 <PieChart>
                   <Pie
                     data={stats.chartData}
                     cx="50%"
                     cy="50%"
                     innerRadius={60}
                     outerRadius={80}
                     paddingAngle={5}
                     dataKey="value"
                   >
                     {stats.chartData.map((entry, index) => (
                       <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[entry.name as Category] || '#ccc'} />
                     ))}
                   </Pie>
                   <Tooltip />
                   <Legend iconType="circle" />
                 </PieChart>
               </ResponsiveContainer>
            ) : (
                <div className="h-full flex items-center justify-center text-gray-400 text-sm">
                    No data to display
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
