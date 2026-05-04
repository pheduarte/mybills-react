import { CATEGORY_SUGGESTIONS } from '../constants/appConstants'
import { sumAmounts } from './transactions'

// This helper keeps the budget tab focused on spending categories.
export function getBudgetCategories(categoryGroups, categoryOptions) {
  const expenseGroupCategories = categoryGroups
    .filter((group) => group.type === 'expense')
    .map((group) => group.category)

  return [...new Set([...CATEGORY_SUGGESTIONS, ...categoryOptions, ...expenseGroupCategories])]
    .filter((category) => category && category !== 'Income')
    .sort((left, right) => {
      const leftIndex = CATEGORY_SUGGESTIONS.indexOf(left)
      const rightIndex = CATEGORY_SUGGESTIONS.indexOf(right)

      if (leftIndex === -1 && rightIndex === -1) {
        return left.localeCompare(right)
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

// This helper prepares every display value used by the budget management tab.
export function createBudgetRows(categories, monthTransactions, monthBudgets = {}) {
  return categories.map((category) => {
    const paidTotal = sumAmounts(
      monthTransactions.filter(
        (transaction) =>
          transaction.type === 'expense' && transaction.category === category && Boolean(transaction.isPaid),
      ),
    )
    const budget = Number(monthBudgets[category] ?? 0)
    const remaining = budget - paidTotal
    const usage = budget > 0 ? Math.min((paidTotal / budget) * 100, 100) : 0

    return {
      budget,
      category,
      paidTotal,
      remaining,
      usage,
    }
  })
}
