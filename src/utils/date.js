// This helper keeps all dates stored in the same yyyy-mm format.
export function getMonthKey(dateString) {
  return dateString.slice(0, 7)
}

// This helper converts a month key back into a real JavaScript Date.
export function getMonthDate(monthKey) {
  const [year, month] = monthKey.split('-').map(Number)
  return new Date(year, month - 1, 1)
}

// This helper moves the dashboard forward or backward one month.
export function shiftMonth(monthKey, step) {
  const nextDate = getMonthDate(monthKey)
  nextDate.setMonth(nextDate.getMonth() + step)

  return `${nextDate.getFullYear()}-${String(nextDate.getMonth() + 1).padStart(2, '0')}`
}

// This helper creates a valid date string inside the selected month.
export function getDefaultDateForMonth(monthKey) {
  return `${monthKey}-01`
}

// This helper shifts a date by a fixed number of days for weekly-based schedules.
export function addDaysToDate(dateString, daysToAdd) {
  const nextDate = new Date(`${dateString}T00:00:00`)
  nextDate.setDate(nextDate.getDate() + daysToAdd)

  return `${nextDate.getFullYear()}-${String(nextDate.getMonth() + 1).padStart(2, '0')}-${String(
    nextDate.getDate(),
  ).padStart(2, '0')}`
}

// This helper adds months while keeping the original day when possible.
export function addMonthsToDate(dateString, monthsToAdd) {
  const [year, month, day] = dateString.split('-').map(Number)
  const nextMonthDate = new Date(year, month - 1 + monthsToAdd, 1)
  const lastDayOfNextMonth = new Date(nextMonthDate.getFullYear(), nextMonthDate.getMonth() + 1, 0).getDate()
  const safeDay = Math.min(day, lastDayOfNextMonth)

  return `${nextMonthDate.getFullYear()}-${String(nextMonthDate.getMonth() + 1).padStart(2, '0')}-${String(
    safeDay,
  ).padStart(2, '0')}`
}
