import { FoodItem } from '../types';

const STORAGE_KEY = 'pantrypal_items';

export const getItems = (): FoodItem[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    console.error("Failed to load items", e);
    return [];
  }
};

export const saveItems = (items: FoodItem[]): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch (e) {
    console.error("Failed to save items", e);
  }
};

export const addItem = (item: FoodItem): FoodItem[] => {
  const items = getItems();
  const newItems = [...items, item];
  saveItems(newItems);
  return newItems;
};

export const updateItem = (updatedItem: FoodItem): FoodItem[] => {
  const items = getItems();
  const newItems = items.map(i => i.id === updatedItem.id ? updatedItem : i);
  saveItems(newItems);
  return newItems;
};

export const deleteItem = (id: string): FoodItem[] => {
  const items = getItems();
  const newItems = items.filter(i => i.id !== id);
  saveItems(newItems);
  return newItems;
};
