export enum Category {
  DAIRY = 'Dairy',
  VEGETABLES = 'Vegetables',
  FRUITS = 'Fruits',
  MEAT = 'Meat',
  PANTRY = 'Pantry',
  BEVERAGES = 'Beverages',
  SNACKS = 'Snacks',
  OTHER = 'Other'
}

export interface FoodItem {
  id: string;
  name: string;
  category: Category;
  quantity: number;
  unit?: string;
  purchaseDate: string; // ISO Date string
  expiryDate: string; // ISO Date string
  notes?: string;
  createdAt: number;
  consumed: boolean;
}

export interface AddItemFormData {
  name: string;
  category: Category;
  quantity: number;
  expiryDate: string;
}

export type ViewState = 'dashboard' | 'inventory' | 'add' | 'settings';
