export const APP_NAME = 'Cafe Admin';
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

// Stock gauge thresholds (0-100). Mirror server/src/services/inventory.service.js
// so the dashboard and inventory page classify stock identically.
export const STOCK_OUT_AT = 15;
export const STOCK_LOW_AT = 35;

export const stockTone = (stock) =>
  stock <= STOCK_OUT_AT ? 'danger' : stock <= STOCK_LOW_AT ? 'warn' : 'good';
export const stockLabel = (stock) =>
  stock <= STOCK_OUT_AT ? 'Out of Stock' : stock <= STOCK_LOW_AT ? 'Low Stock' : 'In Stock';

// No Table model exists on the backend, so this is a fixed local list
// rather than real occupancy data. A dropdown built from this avoids the
// typo/duplicate problems of free-text table entry. Bump the range or
// swap for a real backend-driven list once table management exists.
export const TABLE_NUMBERS = Array.from({ length: 20 }, (_, i) => String(i + 1));

// pending -> "Sent to Kitchen" (order exists, kitchen hasn't started yet)
// preparing -> "Preparing" (kitchen actively working on it)
export const ORDER_STATUS_STEPS = [
  { value: 'pending', label: 'Sent to Kitchen' },
  { value: 'preparing', label: 'Preparing' },
  { value: 'ready', label: 'Ready' },
  { value: 'completed', label: 'Complete' },
];
