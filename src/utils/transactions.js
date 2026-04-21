import { CATEGORY_COLORS, CATEGORY_SUGGESTIONS, RECURRING_MONTH_COUNT } from '../constants/appConstants'
import { addDaysToDate, addMonthsToDate, getDefaultDateForMonth } from './date'

// This helper creates a fresh form state for either add mode or edit mode.
export function createEmptyForm(monthKey) {
  return {
    title: '',
    type: 'expense',
    amount: '',
    date: getDefaultDateForMonth(monthKey),
    category: 'House',
    notes: '',
    isRecurring: false,
    recurringFrequency: 'monthly',
    isInstallment: false,
    installmentCount: '3',
    installmentFrequency: 'monthly',
  }
}

// This helper expands one recurring income or expense into future entries.
export function createRecurringTransactions(baseTransaction, recurringFrequency) {
  const seriesId = crypto.randomUUID()

  return Array.from({ length: RECURRING_MONTH_COUNT }, (_, index) => ({
    ...baseTransaction,
    id: crypto.randomUUID(),
    date:
      recurringFrequency === 'monthly'
        ? addMonthsToDate(baseTransaction.date, index)
        : addDaysToDate(baseTransaction.date, recurringFrequency === 'weekly' ? index * 7 : index * 14),
    seriesId,
    recurrenceIndex: index,
  }))
}

// This helper expands one installment purchase into a fixed payment plan.
export function createInstallmentTransactions(baseTransaction, installmentCount, installmentFrequency) {
  const totalInstallments = Number(installmentCount)

  return Array.from({ length: totalInstallments }, (_, index) => {
    const nextDate =
      installmentFrequency === 'monthly'
        ? addMonthsToDate(baseTransaction.date, index)
        : addDaysToDate(baseTransaction.date, installmentFrequency === 'weekly' ? index * 7 : index * 14)

    return {
      ...baseTransaction,
      id: crypto.randomUUID(),
      date: nextDate,
      notes: baseTransaction.notes
        ? `${baseTransaction.notes} • Installment ${index + 1} of ${totalInstallments}`
        : `Installment ${index + 1} of ${totalInstallments}`,
    }
  })
}

// This helper sorts transactions by date, then by title, to keep rendering stable.
export function sortTransactions(items) {
  return [...items].sort((left, right) => {
    if (left.date === right.date) {
      return left.title.localeCompare(right.title)
    }

    return left.date.localeCompare(right.date)
  })
}

// This helper adds the numbers in a transaction list.
export function sumAmounts(items) {
  return items.reduce((total, item) => total + item.amount, 0)
}

// This helper makes negative balances look intentional in the UI.
export function getBalanceLabel(balance) {
  if (balance > 0) {
    return 'You are ahead this month'
  }

  if (balance < 0) {
    return 'You are overspending this month'
  }

  return 'You are exactly on budget'
}

// This helper gives every category card a nice accent color.
export function getCategoryColor(category) {
  return CATEGORY_COLORS[category] ?? '#a8afc7'
}

// This helper groups the selected month into separate category cards.
export function groupTransactionsByCategory(items) {
  const grouped = items.reduce((groups, item) => {
    if (!groups[item.category]) {
      groups[item.category] = []
    }

    groups[item.category].push(item)
    return groups
  }, {})

  return Object.entries(grouped)
    .map(([category, transactions]) => ({
      category,
      transactions: sortTransactions(transactions),
      total: sumAmounts(transactions),
      type: transactions.every((item) => item.type === 'income') ? 'income' : 'expense',
    }))
    .sort((left, right) => {
      const leftIndex = CATEGORY_SUGGESTIONS.indexOf(left.category)
      const rightIndex = CATEGORY_SUGGESTIONS.indexOf(right.category)

      if (leftIndex === -1 && rightIndex === -1) {
        return left.category.localeCompare(right.category)
      }

      if (leftIndex === -1) {
        return 1
      }

      if (rightIndex === -1) {
        return -1
      }

      return leftIndex - rightIndex
    })
}
