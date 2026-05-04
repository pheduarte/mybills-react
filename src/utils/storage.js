import {
  BUDGET_STORAGE_KEY,
  CATEGORY_ORDER_STORAGE_KEY,
  MONTH_STORAGE_KEY,
  SEED_TRANSACTIONS,
  STORAGE_KEY,
} from '../constants/appConstants'
import { getMonthKey } from './date'

// This helper reads transactions from localStorage and falls back to seed data.
export function getInitialTransactions() {
  const storedValue = localStorage.getItem(STORAGE_KEY)

  if (!storedValue) {
    return SEED_TRANSACTIONS
  }

  try {
    return JSON.parse(storedValue)
  } catch {
    return SEED_TRANSACTIONS
  }
}

// This helper reads locally cached budgets before Firestore has taken over.
export function getInitialBudgets() {
  const storedValue = localStorage.getItem(BUDGET_STORAGE_KEY)

  if (!storedValue) {
    return {}
  }

  try {
    return JSON.parse(storedValue)
  } catch {
    return {}
  }
}

// This helper remembers the month the user was viewing last time.
export function getInitialMonth() {
  const storedValue = localStorage.getItem(MONTH_STORAGE_KEY)

  if (storedValue) {
    return storedValue
  }

  return getMonthKey(new Date().toISOString())
}

// This helper reads the user's preferred category card order.
export function getInitialCategoryOrder() {
  const storedValue = localStorage.getItem(CATEGORY_ORDER_STORAGE_KEY)

  if (!storedValue) {
    return []
  }

  try {
    const parsedValue = JSON.parse(storedValue)

    return Array.isArray(parsedValue) ? parsedValue.filter((item) => typeof item === 'string') : []
  } catch {
    return []
  }
}
