import { Category } from './types';

export const CATEGORY_COLORS: Record<Category, string> = {
  [Category.DAIRY]: '#3b82f6', // blue-500
  [Category.VEGETABLES]: '#22c55e', // green-500
  [Category.FRUITS]: '#eab308', // yellow-500
  [Category.MEAT]: '#ef4444', // red-500
  [Category.PANTRY]: '#a855f7', // purple-500
  [Category.BEVERAGES]: '#06b6d4', // cyan-500
  [Category.SNACKS]: '#f97316', // orange-500
  [Category.OTHER]: '#6b7280', // gray-500
};

export const ONE_DAY_MS = 24 * 60 * 60 * 1000;
export const EXPIRY_WARNING_DAYS = 3;
export const EXPIRY_SOON_DAYS = 7;
