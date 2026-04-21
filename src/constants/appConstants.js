// These local keys help us keep browser-only preferences between visits.
export const STORAGE_KEY = 'mybills-transactions-v1'
export const MONTH_STORAGE_KEY = 'mybills-selected-month-v1'
export const RECURRING_MONTH_COUNT = 24

// These category suggestions mirror the way the bills are usually grouped.
export const CATEGORY_SUGGESTIONS = [
  'House',
  'Subscription',
  'Installments',
  'Transport',
  'Food',
  'Health',
  'Entertainment',
  'Income',
]

// These colors give each category card its own visual identity.
export const CATEGORY_COLORS = {
  House: '#74d66c',
  Subscription: '#ff8ad8',
  Installments: '#ffbe64',
  Transport: '#81d5ff',
  Food: '#ff8b7b',
  Health: '#8f95ff',
  Entertainment: '#c78dff',
  Income: '#6fcf97',
}

// This sample data keeps the dashboard populated for first-time users.
export const SEED_TRANSACTIONS = []
