import React, { useState } from 'react';
import { Category, FoodItem } from '../types';
import { parseFoodItemsFromText } from '../services/geminiService';
import { v4 as uuidv4 } from 'uuid';

interface AddItemProps {
  onAdd: (items: FoodItem[]) => void;
  onCancel: () => void;
}

const AddItem: React.FC<AddItemProps> = ({ onAdd, onCancel }) => {
  const [mode, setMode] = useState<'manual' | 'ai'>('ai');
  const [loading, setLoading] = useState(false);
  const [aiInput, setAiInput] = useState('');
  
  // Manual State
  const [name, setName] = useState('');
  const [category, setCategory] = useState<Category>(Category.OTHER);
  const [quantity, setQuantity] = useState(1);
  const [expiryDate, setExpiryDate] = useState('');

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newItem: FoodItem = {
      id: uuidv4(),
      name,
      category,
      quantity,
      purchaseDate: new Date().toISOString(),
      expiryDate: new Date(expiryDate).toISOString(),
      createdAt: Date.now(),
      consumed: false
    };
    onAdd([newItem]);
  };

  const handleAiSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiInput.trim()) return;

    setLoading(true);
    try {
      const parsedItems = await parseFoodItemsFromText(aiInput);
      const newItems: FoodItem[] = parsedItems.map(p => {
        const expiry = new Date();
        expiry.setDate(expiry.getDate() + p.expiryDateOffsetDays);
        
        return {
            id: uuidv4(),
            name: p.name,
            category: p.category,
            quantity: p.quantity,
            purchaseDate: new Date().toISOString(),
            expiryDate: expiry.toISOString(),
            createdAt: Date.now(),
            consumed: false
        };
      });
      onAdd(newItems);
    } catch (err) {
      alert("Failed to parse. Please try manual entry or check API key.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-white z-50 overflow-y-auto">
      <div className="max-w-md mx-auto min-h-screen flex flex-col p-6">
        <header className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold text-gray-800">Add Items</h2>
            <button onClick={onCancel} className="text-gray-500 hover:text-gray-800">
                <i className="fas fa-times text-xl"></i>
            </button>
        </header>

        {/* Toggle Mode */}
        <div className="bg-gray-100 p-1 rounded-xl flex mb-8">
            <button 
                onClick={() => setMode('ai')}
                className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${mode === 'ai' ? 'bg-white shadow text-green-600' : 'text-gray-500'}`}
            >
                <i className="fas fa-magic mr-2"></i> AI Smart Add
            </button>
            <button 
                onClick={() => setMode('manual')}
                className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${mode === 'manual' ? 'bg-white shadow text-gray-800' : 'text-gray-500'}`}
            >
                Manual Entry
            </button>
        </div>

        {mode === 'ai' ? (
            <form onSubmit={handleAiSubmit} className="flex-1 flex flex-col">
                <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Describe what you bought
                    </label>
                    <textarea
                        value={aiInput}
                        onChange={(e) => setAiInput(e.target.value)}
                        placeholder="e.g., I bought a gallon of milk, 2 cartons of eggs, and a bag of spinach."
                        className="w-full h-40 p-4 rounded-2xl border border-gray-200 focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none bg-gray-50 text-lg"
                        disabled={loading}
                    ></textarea>
                    <p className="mt-3 text-xs text-gray-500">
                        <i className="fas fa-info-circle mr-1"></i>
                        Gemini AI will automatically detect the item name, category, and estimate the expiry date for you.
                    </p>
                </div>
                <button
                    type="submit"
                    disabled={loading || !aiInput}
                    className={`w-full py-4 rounded-2xl font-bold text-lg text-white shadow-lg transition-transform active:scale-95 ${loading ? 'bg-gray-400' : 'bg-gradient-to-r from-green-500 to-emerald-600'}`}
                >
                    {loading ? (
                        <span><i className="fas fa-circle-notch fa-spin mr-2"></i> Analyzing...</span>
                    ) : (
                        'Process with AI'
                    )}
                </button>
            </form>
        ) : (
            <form onSubmit={handleManualSubmit} className="flex-1 space-y-5">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Item Name</label>
                    <input 
                        type="text" 
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-500 focus:outline-none"
                        placeholder="e.g. Cheddar Cheese"
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                        <input 
                            type="number" 
                            min="1"
                            value={quantity}
                            onChange={(e) => setQuantity(Number(e.target.value))}
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-500 focus:outline-none"
                        />
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                        <select 
                            value={category}
                            onChange={(e) => setCategory(e.target.value as Category)}
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-500 focus:outline-none bg-white"
                        >
                            {Object.values(Category).map(c => (
                                <option key={c} value={c}>{c}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Date</label>
                    <input 
                        type="date" 
                        required
                        value={expiryDate}
                        onChange={(e) => setExpiryDate(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-500 focus:outline-none"
                    />
                </div>

                <div className="pt-8">
                     <button
                        type="submit"
                        className="w-full py-4 rounded-2xl font-bold text-lg text-white shadow-lg bg-gray-800 hover:bg-gray-900 transition-transform active:scale-95"
                    >
                        Add Item
                    </button>
                </div>
            </form>
        )}
      </div>
    </div>
  );
};

export default AddItem;
