import React, { useState, useEffect, useCallback } from 'react';
import { FoodItem, ViewState } from './types';
import * as DB from './services/db';
import Dashboard from './components/Dashboard';
import InventoryList from './components/InventoryList';
import AddItem from './components/AddItem';
import { EXPIRY_WARNING_DAYS, ONE_DAY_MS } from './constants';

const App: React.FC = () => {
  const [items, setItems] = useState<FoodItem[]>([]);
  const [view, setView] = useState<ViewState>('dashboard');
  const [showAddModal, setShowAddModal] = useState(false);

  // Helper to refresh data
  const refreshItems = useCallback(() => {
    const loadedItems = DB.getItems();
    setItems(loadedItems);
    return loadedItems;
  }, []);

  // Load items on mount
  useEffect(() => {
    const loadedItems = refreshItems();
    checkNotifications(loadedItems);
    
    // Request notification permission
    if ("Notification" in window && Notification.permission !== "granted") {
        Notification.requestPermission();
    }
  }, [refreshItems]);

  const checkNotifications = (currentItems: FoodItem[]) => {
    if (!("Notification" in window)) return;
    if (Notification.permission !== "granted") return;

    const now = new Date();
    let notificationSent = false;

    currentItems.forEach(item => {
      if (item.consumed) return;
      if (notificationSent) return; // Limit to one notification per session to avoid spam

      const expiry = new Date(item.expiryDate);
      const diffTime = expiry.getTime() - now.getTime();
      const diffDays = Math.ceil(diffTime / ONE_DAY_MS);

      if (diffDays <= EXPIRY_WARNING_DAYS && diffDays >= 0) {
        new Notification(`Expiring Soon: ${item.name}`, {
          body: `${item.name} expires in ${diffDays} days! Consume it soon.`,
          icon: '/icons/icon-192x192.png',
          tag: 'expiry-notification'
        });
        notificationSent = true;
      }
    });
  };

  const handleAddItems = (newItems: FoodItem[]) => {
    newItems.forEach(item => DB.addItem(item));
    refreshItems();
    setShowAddModal(false);
    setView('inventory');
  };

  const handleDeleteItem = (id: string) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      DB.deleteItem(id);
      refreshItems();
    }
  };

  const handleConsumeItem = (item: FoodItem) => {
    DB.updateItem({ ...item, consumed: true });
    refreshItems();
  };

  const renderContent = () => {
    switch (view) {
      case 'dashboard':
        return <Dashboard items={items} />;
      case 'inventory':
        return <InventoryList items={items} onDelete={handleDeleteItem} onConsume={handleConsumeItem} />;
      default:
        return <Dashboard items={items} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20 font-sans">
      <main className="max-w-md mx-auto p-6 pt-8">
        {renderContent()}
      </main>

      {/* Bottom Navigation Bar */}
      <nav className="fixed bottom-0 inset-x-0 bg-white border-t border-gray-200 z-40 pb-safe">
        <div className="max-w-md mx-auto flex justify-around items-center h-16">
          <button 
            onClick={() => setView('dashboard')}
            className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${view === 'dashboard' ? 'text-green-600' : 'text-gray-400 hover:text-gray-600'}`}
          >
            <i className="fas fa-chart-pie text-xl"></i>
            <span className="text-xs font-medium">Dashboard</span>
          </button>

          {/* Floating Add Button Wrapper */}
          <div className="relative -top-6">
            <button 
              onClick={() => setShowAddModal(true)}
              className="w-14 h-14 bg-gray-900 rounded-full text-white shadow-lg flex items-center justify-center hover:bg-gray-800 transition-transform active:scale-95 border-4 border-gray-50"
            >
              <i className="fas fa-plus text-xl"></i>
            </button>
          </div>

          <button 
            onClick={() => setView('inventory')}
            className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${view === 'inventory' ? 'text-green-600' : 'text-gray-400 hover:text-gray-600'}`}
          >
            <i className="fas fa-list text-xl"></i>
            <span className="text-xs font-medium">Pantry</span>
          </button>
        </div>
      </nav>

      {/* Add Item Modal */}
      {showAddModal && (
        <AddItem onAdd={handleAddItems} onCancel={() => setShowAddModal(false)} />
      )}
    </div>
  );
};

export default App;