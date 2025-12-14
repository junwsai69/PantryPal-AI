import React, { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis } from 'recharts';
import { FoodItem, Category } from '../types';
import { CATEGORY_COLORS, ONE_DAY_MS } from '../constants';

interface DashboardProps {
  items: FoodItem[];
}

const Dashboard: React.FC<DashboardProps> = ({ items }) => {
  const stats = useMemo(() => {
    const now = new Date();
    // Reset time part to ensure day comparisons are accurate
    now.setHours(0, 0, 0, 0);

    let expired = 0;
    let in1Day = 0;
    let in3Days = 0;
    let in1Week = 0;
    let in2Weeks = 0;
    
    const categoryCounts: Record<string, number> = {};

    items.forEach(item => {
      if (item.consumed) return;
      
      const expiry = new Date(item.expiryDate);
      expiry.setHours(0, 0, 0, 0);

      const diffTime = expiry.getTime() - now.getTime();
      const diffDays = Math.floor(diffTime / ONE_DAY_MS);

      if (diffDays < 0) {
        expired++;
      } else if (diffDays <= 1) {
        in1Day++;
      } else if (diffDays <= 3) {
        in3Days++;
      } else if (diffDays <= 7) {
        in1Week++;
      } else if (diffDays <= 14) {
        in2Weeks++;
      }

      categoryCounts[item.category] = (categoryCounts[item.category] || 0) + item.quantity;
    });

    const chartData = Object.keys(categoryCounts).map(key => ({
      name: key,
      value: categoryCounts[key]
    }));

    const expiryData = [
      { name: 'Expired', count: expired, color: '#ef4444' },
      { name: '1 Day', count: in1Day, color: '#f97316' },
      { name: '3 Days', count: in3Days, color: '#eab308' },
      { name: '1 Wk', count: in1Week, color: '#84cc16' },
      { name: '2 Wks', count: in2Weeks, color: '#3b82f6' },
    ];

    return { 
      expired, 
      in1Day, 
      in3Days, 
      in1Week, 
      in2Weeks,
      total: items.filter(i => !i.consumed).length, 
      chartData,
      expiryData
    };
  }, [items]);

  const StatCard = ({ label, count, colorClass, iconClass }: { label: string, count: number, colorClass: string, iconClass?: string }) => (
    <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center justify-center min-h-[90px]">
      <div className={`text-2xl font-bold mb-1 ${colorClass}`}>
        {count}
      </div>
      <div className="text-xs text-gray-500 text-center font-medium uppercase tracking-wide">
        {label}
      </div>
    </div>
  );

  return (
    <div className="space-y-6 pb-24">
      <header>
        <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
        <p className="text-gray-500">Inventory Health Check</p>
      </header>

      {/* Summary Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <StatCard label="Expired" count={stats.expired} colorClass="text-red-600" />
        <StatCard label="1 Day" count={stats.in1Day} colorClass="text-orange-500" />
        <StatCard label="3 Days" count={stats.in3Days} colorClass="text-yellow-600" />
        <StatCard label="1 Week" count={stats.in1Week} colorClass="text-lime-600" />
        <StatCard label="2 Weeks" count={stats.in2Weeks} colorClass="text-blue-500" />
        <div className="bg-gray-800 p-3 rounded-xl shadow-sm border border-gray-800 flex flex-col items-center justify-center min-h-[90px]">
           <div className="text-2xl font-bold text-white mb-1">{stats.total}</div>
           <div className="text-xs text-gray-300 text-center font-medium uppercase tracking-wide">Total Items</div>
        </div>
      </div>
      
      {/* Alerts */}
      {stats.expired > 0 && (
         <div className="bg-red-50 border border-red-100 p-4 rounded-xl flex items-start gap-3">
            <i className="fas fa-exclamation-triangle text-red-500 mt-1"></i>
            <div>
                <h4 className="text-sm font-bold text-red-800">Action Required</h4>
                <p className="text-xs text-red-700 mt-1">
                  You have <span className="font-bold">{stats.expired}</span> expired items. 
                  Please review and remove them.
                </p>
            </div>
          </div>
      )}

      {/* Expiry Timeline Chart */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Expiry Timeline</h3>
        <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.expiryData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} allowDecimals={false} />
                <Tooltip 
                  cursor={{ fill: 'transparent' }}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {stats.expiryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
        </div>
      </div>

      {/* Category Chart */}
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
                   <Legend iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
                 </PieChart>
               </ResponsiveContainer>
            ) : (
                <div className="h-full flex flex-col items-center justify-center text-gray-400">
                    <i className="fas fa-chart-pie text-3xl mb-2 opacity-20"></i>
                    <span className="text-sm">No data available</span>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;