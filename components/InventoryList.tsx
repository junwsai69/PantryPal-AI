import React, { useState, useMemo } from 'react';
import { FoodItem, Category } from '../types';
import { CATEGORY_COLORS, ONE_DAY_MS } from '../constants';

interface InventoryListProps {
  items: FoodItem[];
  onDelete: (id: string) => void;
  onConsume: (item: FoodItem) => void;
}

const InventoryList: React.FC<InventoryListProps> = ({ items, onDelete, onConsume }) => {
  const [filterCategory, setFilterCategory] = useState<Category | 'All'>('All');
  const [sortBy, setSortBy] = useState<'expiry' | 'name'>('expiry');

  const filteredItems = useMemo(() => {
    let result = items.filter(item => !item.consumed);
    if (filterCategory !== 'All') {
      result = result.filter(item => item.category === filterCategory);
    }
    return result.sort((a, b) => {
      if (sortBy === 'expiry') {
        return new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime();
      } else {
        return a.name.localeCompare(b.name);
      }
    });
  }, [items, filterCategory, sortBy]);

  const getExpiryStatus = (expiryDate: string) => {
    const now = new Date();
    const expiry = new Date(expiryDate);
    const diffTime = expiry.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / ONE_DAY_MS);

    if (diffDays < 0) return { label: 'Expired', color: 'text-red-600 bg-red-100', days: diffDays };
    if (diffDays <= 3) return { label: `In ${diffDays}d`, color: 'text-orange-600 bg-orange-100', days: diffDays };
    if (diffDays <= 7) return { label: `In ${diffDays}d`, color: 'text-yellow-600 bg-yellow-100', days: diffDays };
    return { label: new Date(expiryDate).toLocaleDateString(), color: 'text-gray-500 bg-gray-100', days: diffDays };
  };

  return (
    <div className="space-y-4 pb-24">
       <header>
        <h1 className="text-2xl font-bold text-gray-800">Inventory</h1>
        <div className="flex gap-2 mt-2 overflow-x-auto no-scrollbar pb-2">
            <button
                onClick={() => setFilterCategory('All')}
                className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${filterCategory === 'All' ? 'bg-gray-800 text-white' : 'bg-white text-gray-600 border border-gray-200'}`}
            >
                All
            </button>
            {Object.values(Category).map(cat => (
                <button
                key={cat}
                onClick={() => setFilterCategory(cat)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${filterCategory === cat ? 'bg-gray-800 text-white' : 'bg-white text-gray-600 border border-gray-200'}`}
                >
                {cat}
                </button>
            ))}
        </div>
      </header>

      <div className="grid gap-3">
        {filteredItems.length === 0 ? (
             <div className="text-center py-10">
                <div className="text-6xl mb-4">🥑</div>
                <h3 className="text-lg font-medium text-gray-900">Your pantry is empty</h3>
                <p className="text-gray-500">Add some items to get started!</p>
             </div>
        ) : (
            filteredItems.map(item => {
                const status = getExpiryStatus(item.expiryDate);
                const categoryColor = CATEGORY_COLORS[item.category];
                
                return (
                    <div key={item.id} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between group">
                        <div className="flex items-center gap-4">
                            <div className="w-2 h-12 rounded-full" style={{ backgroundColor: categoryColor }}></div>
                            <div>
                                <h3 className="font-semibold text-gray-800">{item.name}</h3>
                                <div className="flex items-center gap-2 text-xs mt-1">
                                    <span className={`px-2 py-0.5 rounded-md font-medium ${status.color}`}>
                                        {status.days < 0 ? 'Expired' : 'Expires'} {status.label}
                                    </span>
                                    <span className="text-gray-400">•</span>
                                    <span className="text-gray-500">{item.category}</span>
                                    <span className="text-gray-400">•</span>
                                    <span className="text-gray-500">Qty: {item.quantity}</span>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-1 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                             <button 
                                onClick={() => onConsume(item)}
                                className="p-2 text-green-600 hover:bg-green-50 rounded-full"
                                title="Consume"
                            >
                                <i className="fas fa-check"></i>
                            </button>
                            <button 
                                onClick={() => onDelete(item.id)}
                                className="p-2 text-red-500 hover:bg-red-50 rounded-full"
                                title="Delete"
                            >
                                <i className="fas fa-trash"></i>
                            </button>
                        </div>
                    </div>
                );
            })
        )}
      </div>
    </div>
  );
};

export default InventoryList;
