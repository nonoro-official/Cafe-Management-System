/**
 * Kiosk menu configuration
 *
 * Add categories:
 *   { id: 'coffee', label: 'Coffee' }
 *
 * Add menu items:
 *   { id: 'latte', categoryId: 'coffee', name: 'Latte', price: 4.5, image: latteImage }
 *
 * Images (optional):
 *   import latteImage from '../assets/menu/latte.png';
 *   then set `image: latteImage` on the item
 */

export const kioskCategories = [
  { id: 'c1', label: 'Coffee' },
  { id: 'c2', label: 'Pastries' },
  { id: 'c3', label: 'Sandwiches' },
  { id: 'c4', label: 'Salads' },
  { id: 'c5', label: 'Desserts' },
];

export const kioskMenuItems = [
  { id: 'item1', categoryId: 'c1', name: 'Item1' },
  { id: 'item2', categoryId: 'c1', name: 'Item2' },
  { id: 'item3', categoryId: 'c1', name: 'Item3' },
  { id: 'item4', categoryId: 'c1', name: 'Item4' },
  { id: 'item5', categoryId: 'c1', name: 'Item5' },
  { id: 'item6', categoryId: 'c1', name: 'Item6' },
  { id: 'item7', categoryId: 'c1', name: 'Item7' },
  { id: 'item8', categoryId: 'c1', name: 'Item8' },
  { id: 'item9', categoryId: 'c1', name: 'Item9' },
  { id: 'item10', categoryId: 'c1', name: 'Item10' },
];

export const getMenuItemsByCategory = (categoryId) =>
  kioskMenuItems.filter((item) => item.categoryId === categoryId);

export const getMenuItemById = (itemId) =>
  kioskMenuItems.find((item) => item.id === itemId);
