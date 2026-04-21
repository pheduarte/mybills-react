import { getMonthDate } from './date'

// This helper formats every dollar amount consistently.
export function formatCurrency(value, shouldHide = false) {
  if (shouldHide) {
    return '••••'
  }

  return new Intl.NumberFormat('en-AU', {
    style: 'currency',
    currency: 'AUD',
  }).format(value)
}

// This helper prints the selected month in a friendly heading format.
export function formatMonthLabel(monthKey) {
  return new Intl.DateTimeFormat('en-AU', {
    month: 'long',
    year: 'numeric',
  }).format(getMonthDate(monthKey))
}

// This helper prints short dates inside cards and lists.
export function formatShortDate(dateString) {
  return new Intl.DateTimeFormat('en-AU', {
    day: 'numeric',
    month: 'short',
  }).format(new Date(`${dateString}T00:00:00`))
}
