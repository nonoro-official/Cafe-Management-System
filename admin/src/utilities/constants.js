export const APP_NAME = 'Cafe Admin';
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

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
