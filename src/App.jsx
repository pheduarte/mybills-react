import { useEffect, useState } from 'react'
import './App.css'

// These localStorage keys let the app remember data between refreshes.
const STORAGE_KEY = 'mybills-transactions-v1'
const MONTH_STORAGE_KEY = 'mybills-selected-month-v1'
const RECURRING_MONTH_COUNT = 24

// These category suggestions mirror the way you already group your bills.
const CATEGORY_SUGGESTIONS = [
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
const CATEGORY_COLORS = {
  House: '#74d66c',
  Subscription: '#ff8ad8',
  Installments: '#ffbe64',
  Transport: '#81d5ff',
  Food: '#ff8b7b',
  Health: '#8f95ff',
  Entertainment: '#c78dff',
  Income: '#6fcf97',
}

// This sample data makes the dashboard feel alive on first load.
const SEED_TRANSACTIONS = [
  {
    id: 'txn-1',
    title: 'Salary 1',
    type: 'income',
    amount: 1200,
    date: '2026-04-14',
    category: 'Income',
    notes: 'First pay cycle',
  },
  {
    id: 'txn-2',
    title: 'Salary 2',
    type: 'income',
    amount: 1200,
    date: '2026-04-28',
    category: 'Income',
    notes: 'Second pay cycle',
  },
  {
    id: 'txn-3',
    title: 'Rent',
    type: 'expense',
    amount: 620,
    date: '2026-04-09',
    category: 'House',
    notes: 'Main rent payment',
  },
  {
    id: 'txn-4',
    title: 'Electricity',
    type: 'expense',
    amount: 163.65,
    date: '2026-04-08',
    category: 'House',
    notes: 'Monthly utility bill',
  },
  {
    id: 'txn-5',
    title: 'Electricity',
    type: 'expense',
    amount: 175.09,
    date: '2026-04-27',
    category: 'House',
    notes: 'Catch-up payment',
  },
  {
    id: 'txn-6',
    title: 'Gas',
    type: 'expense',
    amount: 24.65,
    date: '2026-04-24',
    category: 'House',
    notes: 'Cooking gas top-up',
  },
  {
    id: 'txn-7',
    title: 'Internet',
    type: 'expense',
    amount: 89,
    date: '2026-04-18',
    category: 'House',
    notes: 'Home broadband',
  },
  {
    id: 'txn-8',
    title: 'Disney+',
    type: 'expense',
    amount: 15.99,
    date: '2026-04-05',
    category: 'Subscription',
    notes: 'Streaming',
  },
  {
    id: 'txn-9',
    title: 'Amazon',
    type: 'expense',
    amount: 9.99,
    date: '2026-04-01',
    category: 'Subscription',
    notes: 'Prime',
  },
  {
    id: 'txn-10',
    title: 'YouTube',
    type: 'expense',
    amount: 39.99,
    date: '2026-04-06',
    category: 'Subscription',
    notes: 'Family plan',
  },
  {
    id: 'txn-11',
    title: 'ChatGPT',
    type: 'expense',
    amount: 31.9,
    date: '2026-04-08',
    category: 'Subscription',
    notes: 'Work tools',
  },
  {
    id: 'txn-12',
    title: 'iCloud',
    type: 'expense',
    amount: 14.99,
    date: '2026-04-16',
    category: 'Subscription',
    notes: 'Storage',
  },
  {
    id: 'txn-13',
    title: 'iPhone',
    type: 'expense',
    amount: 15.99,
    date: '2026-04-29',
    category: 'Subscription',
    notes: 'Device storage upgrade',
  },
  {
    id: 'txn-14',
    title: 'Gym',
    type: 'expense',
    amount: 31.99,
    date: '2026-04-01',
    category: 'Installments',
    notes: 'Installment 1 of 4',
  },
  {
    id: 'txn-15',
    title: 'AP Chemist',
    type: 'expense',
    amount: 33.75,
    date: '2026-04-03',
    category: 'Installments',
    notes: 'Installment 1 of 4',
  },
  {
    id: 'txn-16',
    title: 'AP Amazon',
    type: 'expense',
    amount: 24.75,
    date: '2026-04-03',
    category: 'Installments',
    notes: 'Installment 1 of 4',
  },
  {
    id: 'txn-17',
    title: 'Salary 1',
    type: 'income',
    amount: 1260,
    date: '2026-05-14',
    category: 'Income',
    notes: 'Pay rise example',
  },
  {
    id: 'txn-18',
    title: 'Salary 2',
    type: 'income',
    amount: 1260,
    date: '2026-05-28',
    category: 'Income',
    notes: 'Pay rise example',
  },
  {
    id: 'txn-19',
    title: 'Rent',
    type: 'expense',
    amount: 620,
    date: '2026-05-09',
    category: 'House',
    notes: 'Main rent payment',
  },
  {
    id: 'txn-20',
    title: 'Internet',
    type: 'expense',
    amount: 89,
    date: '2026-05-18',
    category: 'House',
    notes: 'Home broadband',
  },
  {
    id: 'txn-21',
    title: 'ChatGPT',
    type: 'expense',
    amount: 31.9,
    date: '2026-05-08',
    category: 'Subscription',
    notes: 'Work tools',
  },
]

// This helper keeps all dates stored in the same yyyy-mm format.
function getMonthKey(dateString) {
  return dateString.slice(0, 7)
}

// This helper converts a month key back into a real JavaScript Date.
function getMonthDate(monthKey) {
  const [year, month] = monthKey.split('-').map(Number)
  return new Date(year, month - 1, 1)
}

// This helper moves the dashboard forward or backward one month.
function shiftMonth(monthKey, step) {
  const nextDate = getMonthDate(monthKey)
  nextDate.setMonth(nextDate.getMonth() + step)

  return `${nextDate.getFullYear()}-${String(nextDate.getMonth() + 1).padStart(2, '0')}`
}

// This helper creates a valid date string inside the selected month.
function getDefaultDateForMonth(monthKey) {
  return `${monthKey}-01`
}

// This helper creates a fresh form state for either add mode or edit mode.
function createEmptyForm(monthKey) {
  return {
    title: '',
    type: 'expense',
    amount: '',
    date: getDefaultDateForMonth(monthKey),
    category: 'House',
    notes: '',
    isRecurring: false,
    isInstallment: false,
    installmentCount: '3',
    installmentFrequency: 'monthly',
  }
}

// This helper shifts a date by a fixed number of days for weekly-based schedules.
function addDaysToDate(dateString, daysToAdd) {
  const nextDate = new Date(`${dateString}T00:00:00`)
  nextDate.setDate(nextDate.getDate() + daysToAdd)

  return `${nextDate.getFullYear()}-${String(nextDate.getMonth() + 1).padStart(2, '0')}-${String(
    nextDate.getDate(),
  ).padStart(2, '0')}`
}

// This helper adds months while keeping the original day when possible.
function addMonthsToDate(dateString, monthsToAdd) {
  const [year, month, day] = dateString.split('-').map(Number)
  const nextMonthDate = new Date(year, month - 1 + monthsToAdd, 1)
  const lastDayOfNextMonth = new Date(nextMonthDate.getFullYear(), nextMonthDate.getMonth() + 1, 0).getDate()
  const safeDay = Math.min(day, lastDayOfNextMonth)

  return `${nextMonthDate.getFullYear()}-${String(nextMonthDate.getMonth() + 1).padStart(2, '0')}-${String(
    safeDay,
  ).padStart(2, '0')}`
}

// This helper expands one recurring expense into monthly entries for the next two years.
function createRecurringTransactions(baseTransaction) {
  const seriesId = crypto.randomUUID()

  return Array.from({ length: RECURRING_MONTH_COUNT }, (_, index) => ({
    ...baseTransaction,
    id: crypto.randomUUID(),
    date: addMonthsToDate(baseTransaction.date, index),
    seriesId,
    recurrenceIndex: index,
  }))
}

// This helper expands one installment purchase into a fixed payment plan.
function createInstallmentTransactions(baseTransaction, installmentCount, installmentFrequency) {
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
function sortTransactions(items) {
  return [...items].sort((left, right) => {
    if (left.date === right.date) {
      return left.title.localeCompare(right.title)
    }

    return left.date.localeCompare(right.date)
  })
}

// This helper adds the numbers in a transaction list.
function sumAmounts(items) {
  return items.reduce((total, item) => total + item.amount, 0)
}

// This helper formats every dollar amount consistently.
function formatCurrency(value, shouldHide = false) {
  if (shouldHide) {
    return '••••'
  }

  return new Intl.NumberFormat('en-AU', {
    style: 'currency',
    currency: 'AUD',
  }).format(value)
}

// This helper prints the selected month in a friendly heading format.
function formatMonthLabel(monthKey) {
  return new Intl.DateTimeFormat('en-AU', {
    month: 'long',
    year: 'numeric',
  }).format(getMonthDate(monthKey))
}

// This helper prints short dates inside cards and lists.
function formatShortDate(dateString) {
  return new Intl.DateTimeFormat('en-AU', {
    day: 'numeric',
    month: 'short',
  }).format(new Date(`${dateString}T00:00:00`))
}

// This helper makes negative balances look intentional in the UI.
function getBalanceLabel(balance) {
  if (balance > 0) {
    return 'You are ahead this month'
  }

  if (balance < 0) {
    return 'You are overspending this month'
  }

  return 'You are exactly on budget'
}

// This helper gives every category card a nice accent color.
function getCategoryColor(category) {
  return CATEGORY_COLORS[category] ?? '#a8afc7'
}

// This helper groups the selected month into separate category cards.
function groupTransactionsByCategory(items) {
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

// This helper reads transactions from localStorage and falls back to seed data.
function getInitialTransactions() {
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

// This helper remembers the month the user was viewing last time.
function getInitialMonth() {
  const storedValue = localStorage.getItem(MONTH_STORAGE_KEY)

  if (storedValue) {
    return storedValue
  }

  return getMonthKey(new Date().toISOString())
}

// This small presentational component keeps our stat cards consistent.
function SummaryStat({ label, value, tone, hideAmounts }) {
  return (
    <div className="summary-stat">
      <span className={`summary-icon ${tone}`}>{tone === 'income' ? '+' : tone === 'expense' ? '-' : '='}</span>
      <div>
        <p className="summary-label">{label}</p>
        <strong>{formatCurrency(value, hideAmounts)}</strong>
      </div>
    </div>
  )
}

// This component renders one category card at a time.
function CategoryCard({ group, hideAmounts, onDeleteTransaction, onEditTransaction }) {
  return (
    <article
      className={`category-card ${group.type}`}
      style={{ '--category-accent': getCategoryColor(group.category) }}
    >
      <header className="category-card__header">
        <div>
          <p className="eyebrow">{group.type === 'income' ? 'Income stream' : 'Expense category'}</p>
          <h3>{group.category}</h3>
        </div>
        <strong className={group.type === 'income' ? 'amount-positive' : 'amount-negative'}>
          {group.type === 'income' ? '+' : '-'}
          {formatCurrency(group.total, hideAmounts)}
        </strong>
      </header>

      <div className="category-card__list">
        {group.transactions.map((transaction) => (
          <div className="transaction-row" key={transaction.id}>
            <button
              className="transaction-row__content"
              type="button"
              onClick={() => onEditTransaction(transaction)}
            >
              <strong>{transaction.title}</strong>
              <p>
                {formatShortDate(transaction.date)}
                {transaction.notes ? ` • ${transaction.notes}` : ''}
                {transaction.seriesId ? ' • Recurring' : ''}
              </p>
            </button>

            <div className="transaction-row__meta">
              <span className={transaction.type === 'income' ? 'amount-positive' : 'amount-negative'}>
                {transaction.type === 'income' ? '+' : '-'}
                {formatCurrency(transaction.amount, hideAmounts)}
              </span>
              <button
                className="ghost-button"
                type="button"
                onClick={() => onDeleteTransaction(transaction)}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </article>
  )
}

function App() {
  // This state stores every income and expense in the app.
  const [transactions, setTransactions] = useState(getInitialTransactions)

  // This state tracks which month the dashboard should show.
  const [selectedMonth, setSelectedMonth] = useState(getInitialMonth)

  // This state lets the user hide balances when sharing the screen.
  const [hideAmounts, setHideAmounts] = useState(false)

  // This state controls whether the bottom add-entry composer is open.
  const [isEntryOpen, setIsEntryOpen] = useState(false)

  // This state tracks whether the bottom composer is editing an existing transaction.
  const [editingTransactionId, setEditingTransactionId] = useState(null)

  // This state controls the add-transaction form inputs.
  const [formState, setFormState] = useState(() => createEmptyForm(getInitialMonth()))

  // This effect saves transactions whenever the list changes.
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions))
  }, [transactions])

  // This effect remembers the month the user viewed last.
  useEffect(() => {
    localStorage.setItem(MONTH_STORAGE_KEY, selectedMonth)
  }, [selectedMonth])

  // This derived list contains only the transactions for the visible month.
  const monthTransactions = sortTransactions(
    transactions.filter((transaction) => getMonthKey(transaction.date) === selectedMonth),
  )

  // These derived lists make it easy to calculate each section of the dashboard.
  const incomeTransactions = monthTransactions.filter((transaction) => transaction.type === 'income')
  const expenseTransactions = monthTransactions.filter((transaction) => transaction.type === 'expense')

  // These totals power the summary card at the top of the screen.
  const totalIncome = sumAmounts(incomeTransactions)
  const totalExpenses = sumAmounts(expenseTransactions)
  const balance = totalIncome - totalExpenses

  // This grouped data becomes the list of separate category cards.
  const categoryGroups = groupTransactionsByCategory(monthTransactions)

  // This derived list feeds the category suggestion menu while still allowing new values.
  const categoryOptions = [...new Set([...CATEGORY_SUGGESTIONS, ...transactions.map((item) => item.category)])].sort(
    (left, right) => left.localeCompare(right),
  )

  // This is used to draw the split bar between income and expense totals.
  const cashFlowTotal = totalIncome + totalExpenses
  const incomeShare = cashFlowTotal === 0 ? 50 : (totalIncome / cashFlowTotal) * 100

  // This list powers the "Upcoming payments" section for the selected month.
  const upcomingTransactions = expenseTransactions.slice(0, 5)

  // This helper restores the composer to its default add-entry state.
  function resetComposer(monthKey = selectedMonth) {
    setEditingTransactionId(null)
    setFormState(createEmptyForm(monthKey))
    setIsEntryOpen(false)
  }

  // This handler updates form fields as the user types.
  function handleInputChange(event) {
    const { name, value } = event.target

    setFormState((currentForm) => {
      // We gently swap the default category when the user switches transaction type.
      if (name === 'type') {
        return {
          ...currentForm,
          type: value,
          isRecurring: value === 'income' ? false : currentForm.isRecurring,
          isInstallment: value === 'income' ? false : currentForm.isInstallment,
          category:
            value === 'income' && currentForm.category === 'House'
              ? 'Income'
              : value === 'expense' && currentForm.category === 'Income'
                ? 'House'
                : currentForm.category,
        }
      }

      return {
        ...currentForm,
        [name]: value,
      }
    })
  }

  // This handler either creates a new transaction or updates the one being edited.
  function handleSaveTransaction(event) {
    event.preventDefault()

    const amount = Number(formState.amount)

    if (!formState.title || !formState.date || !formState.category || Number.isNaN(amount) || amount <= 0) {
      return
    }

    const nextTransaction = {
      id: crypto.randomUUID(),
      title: formState.title.trim(),
      type: formState.type,
      amount,
      date: formState.date,
      category: formState.category.trim(),
      notes: formState.notes.trim(),
    }

    const targetMonth = getMonthKey(formState.date)

    if (editingTransactionId) {
      setTransactions((currentTransactions) =>
        currentTransactions.map((transaction) =>
          transaction.id === editingTransactionId
            ? {
                ...transaction,
                title: nextTransaction.title,
                type: nextTransaction.type,
                amount: nextTransaction.amount,
                date: nextTransaction.date,
                category: nextTransaction.category,
                notes: nextTransaction.notes,
              }
            : transaction,
        ),
      )
    } else if (formState.type === 'expense' && formState.isInstallment) {
      setTransactions((currentTransactions) => [
        ...currentTransactions,
        ...createInstallmentTransactions(
          {
            ...nextTransaction,
            type: 'expense',
          },
          formState.installmentCount,
          formState.installmentFrequency,
        ),
      ])
    } else if (formState.type === 'expense' && formState.isRecurring) {
      setTransactions((currentTransactions) => [
        ...currentTransactions,
        ...createRecurringTransactions({
          ...nextTransaction,
          type: 'expense',
        }),
      ])
    } else {
      setTransactions((currentTransactions) => [...currentTransactions, nextTransaction])
    }

    setSelectedMonth(targetMonth)
    resetComposer(targetMonth)
  }

  // This handler opens the existing composer and fills it with the selected transaction.
  function handleEditTransaction(transaction) {
    setEditingTransactionId(transaction.id)
    setSelectedMonth(getMonthKey(transaction.date))
    setFormState({
      title: transaction.title,
      type: transaction.type,
      amount: String(transaction.amount),
      date: transaction.date,
      category: transaction.category,
      notes: transaction.notes ?? '',
      isRecurring: Boolean(transaction.seriesId),
    })
    setIsEntryOpen(true)
  }

  // This handler deletes single entries or trims a recurring series from the selected point forward.
  function handleDeleteTransaction(transactionToDelete) {
    if (!transactionToDelete.seriesId) {
      setTransactions((currentTransactions) =>
        currentTransactions.filter((transaction) => transaction.id !== transactionToDelete.id),
      )

      if (editingTransactionId === transactionToDelete.id) {
        resetComposer(getMonthKey(transactionToDelete.date))
      }

      return
    }

    const deleteChoice = window.prompt(
      "This is a recurring expense. Type 'one' to delete only this expense, or 'future' to delete this one and all future expenses.",
      'one',
    )

    if (!deleteChoice) {
      return
    }

    const normalizedChoice = deleteChoice.trim().toLowerCase()

    if (normalizedChoice !== 'one' && normalizedChoice !== 'future') {
      return
    }

    const editedTransaction = transactions.find((transaction) => transaction.id === editingTransactionId)

    setTransactions((currentTransactions) =>
      currentTransactions.filter((transaction) => {
        if (transaction.seriesId !== transactionToDelete.seriesId) {
          return true
        }

        if (normalizedChoice === 'one') {
          return transaction.id !== transactionToDelete.id
        }

        return transaction.recurrenceIndex < transactionToDelete.recurrenceIndex
      }),
    )

    if (
      editedTransaction &&
      editedTransaction.seriesId === transactionToDelete.seriesId &&
      (normalizedChoice === 'one'
        ? editedTransaction.id === transactionToDelete.id
        : editedTransaction.recurrenceIndex >= transactionToDelete.recurrenceIndex)
    ) {
      resetComposer(getMonthKey(transactionToDelete.date))
    }
  }

  // This handler keeps month navigation and the form date moving together.
  function handleMonthChange(step) {
    const nextMonth = shiftMonth(selectedMonth, step)

    setSelectedMonth(nextMonth)
    setFormState((currentForm) =>
      editingTransactionId
        ? createEmptyForm(nextMonth)
        : {
            ...currentForm,
            date: getDefaultDateForMonth(nextMonth),
          },
    )
    setEditingTransactionId(null)
  }

  return (
    <main className="app-shell">
      {/* This top area acts like a simple mobile app header. */}
      <header className="topbar">
        <div>
          <h1>MyBills</h1>
        </div>

        <button
          className="icon-button"
          type="button"
          onClick={() => setHideAmounts((currentValue) => !currentValue)}
        >
          {hideAmounts ? 'Show' : 'Hide'}
        </button>
      </header>

      {/* This hero card summarizes the selected month at a glance. */}
      <section className="hero-card">
        <div className="hero-card__header">
          <div className="hero-card__month">
            <p className="eyebrow">Cashboard</p>
            <h2>{formatMonthLabel(selectedMonth)}</h2>
          </div>
        </div>

        <div className="hero-card__nav">
          <button
            className="icon-button icon-button--soft"
            type="button"
            onClick={() => handleMonthChange(-1)}
          >
            Prev
          </button>

          <button
            className="icon-button icon-button--soft"
            type="button"
            onClick={() => handleMonthChange(1)}
          >
            Next
          </button>
        </div>

        <div className="progress-card">
          <div className="progress-bar" aria-hidden="true">
            <span className="progress-bar__income" style={{ width: `${incomeShare}%` }} />
            <span className="progress-bar__expense" style={{ width: `${100 - incomeShare}%` }} />
          </div>

          <div className="summary-grid">
            <SummaryStat label="Income" value={totalIncome} tone="income" hideAmounts={hideAmounts} />
            <SummaryStat label="Expenses" value={totalExpenses} tone="expense" hideAmounts={hideAmounts} />
          </div>

          <div className={`balance-row ${balance >= 0 ? 'positive' : 'negative'}`}>
            <p>{getBalanceLabel(balance)}</p>
            <strong>{formatCurrency(balance, hideAmounts)}</strong>
          </div>
        </div>
      </section>

      {/* This section surfaces the next expenses in the selected month. */}
      <section className="panel">
        <div className="panel__title">
          <div>
            <p className="eyebrow">Month timeline</p>
            <h3>Upcoming payments</h3>
          </div>
          <span className="chip">{upcomingTransactions.length} items</span>
        </div>

        {upcomingTransactions.length > 0 ? (
          <div className="upcoming-list">
            {upcomingTransactions.map((transaction) => (
              <div className="upcoming-row" key={transaction.id}>
                <button
                  className="transaction-row__content"
                  type="button"
                  onClick={() => handleEditTransaction(transaction)}
                >
                  <strong>{transaction.title}</strong>
                  <p>
                    {transaction.category}
                    {transaction.notes ? ` • ${transaction.notes}` : ''}
                    {transaction.seriesId ? ' • Recurring' : ''}
                  </p>
                </button>
                <div className="upcoming-row__meta">
                  <span>{formatShortDate(transaction.date)}</span>
                  <strong className="amount-negative">-{formatCurrency(transaction.amount, hideAmounts)}</strong>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <strong>No expenses in this month yet</strong>
            <p>Add a bill above and it will appear here automatically.</p>
          </div>
        )}
      </section>

      {/* This final section renders each category as its own modern card. */}
      <section className="categories-section">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Monthly breakdown</p>
            <h3>Category cards</h3>
          </div>
          <span className="chip">{categoryGroups.length} groups</span>
        </div>

        {categoryGroups.length > 0 ? (
          <div className="categories-grid">
            {categoryGroups.map((group) => (
              <CategoryCard
                group={group}
                hideAmounts={hideAmounts}
                key={group.category}
                onDeleteTransaction={handleDeleteTransaction}
                onEditTransaction={handleEditTransaction}
              />
            ))}
          </div>
        ) : (
          <div className="panel empty-state">
            <strong>This month is empty</strong>
            <p>Use the form to add your first income or expense for {formatMonthLabel(selectedMonth)}.</p>
          </div>
        )}
      </section>

      {/* This bottom composer stays visible and expands into the full form when tapped. */}
      <section className={`panel composer ${isEntryOpen ? 'composer--open' : 'composer--closed'}`}>
        {!isEntryOpen ? (
          <button className="composer-trigger" type="button" onClick={() => setIsEntryOpen(true)}>
            <span className="composer-trigger__label">Add new entry</span>
            <span className="composer-trigger__placeholder">Tap to add income or expense...</span>
          </button>
        ) : (
          <>
            <div className="panel__title">
              <div>
                <p className="eyebrow">{editingTransactionId ? 'Edit entry' : 'Add new entry'}</p>
                <h3>{editingTransactionId ? 'Update transaction' : 'Income and expenses'}</h3>
              </div>

              <div className="composer-actions">
                <span className="chip">Saved locally</span>
                <button className="ghost-button" type="button" onClick={() => resetComposer()}>
                  Close
                </button>
              </div>
            </div>

            <form className="transaction-form" onSubmit={handleSaveTransaction}>
              <label>
                Title
                <input
                  name="title"
                  type="text"
                  placeholder="Rent, Salary, Internet..."
                  value={formState.title}
                  onChange={handleInputChange}
                />
              </label>

              <div className="form-row">
                <label>
                  Type
                  <select name="type" value={formState.type} onChange={handleInputChange}>
                    <option value="expense">Expense</option>
                    <option value="income">Income</option>
                  </select>
                </label>

                <label>
                  Amount
                  <input
                    name="amount"
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    value={formState.amount}
                    onChange={handleInputChange}
                  />
                </label>
              </div>

              <div className="form-row">
                <label>
                  Date
                  <input name="date" type="date" value={formState.date} onChange={handleInputChange} />
                </label>

                <label>
                  Category
                  <input
                    list="category-suggestions"
                    name="category"
                    type="text"
                    placeholder="House"
                    value={formState.category}
                    onChange={handleInputChange}
                  />
                  <datalist id="category-suggestions">
                    {categoryOptions.map((category) => (
                      <option key={category} value={category} />
                    ))}
                  </datalist>
                </label>
              </div>

              <label>
                Notes
                <input
                  name="notes"
                  type="text"
                  placeholder="Installment 2 of 5, Streaming, Pay cycle..."
                  value={formState.notes}
                  onChange={handleInputChange}
                />
              </label>

              {formState.type === 'expense' && !editingTransactionId ? (
                <>
                  <label className="checkbox-row">
                    <input
                      checked={formState.isRecurring}
                      name="isRecurring"
                      type="checkbox"
                      onChange={(event) =>
                        setFormState((currentForm) => ({
                          ...currentForm,
                          isRecurring: event.target.checked,
                          isInstallment: event.target.checked ? false : currentForm.isInstallment,
                        }))
                      }
                    />
                    <span>Create this expense for the next months automatically</span>
                  </label>

                  <label className="checkbox-row">
                    <input
                      checked={formState.isInstallment}
                      name="isInstallment"
                      type="checkbox"
                      onChange={(event) =>
                        setFormState((currentForm) => ({
                          ...currentForm,
                          isInstallment: event.target.checked,
                          isRecurring: event.target.checked ? false : currentForm.isRecurring,
                        }))
                      }
                    />
                    <span>Split this expense into installments</span>
                  </label>

                  {formState.isInstallment ? (
                    <div className="form-row">
                      <label>
                        Payments
                        <select
                          name="installmentCount"
                          value={formState.installmentCount}
                          onChange={handleInputChange}
                        >
                          {Array.from({ length: 23 }, (_, index) => String(index + 2)).map((count) => (
                            <option key={count} value={count}>
                              {count} payments
                            </option>
                          ))}
                        </select>
                      </label>

                      <label>
                        Frequency
                        <select
                          name="installmentFrequency"
                          value={formState.installmentFrequency}
                          onChange={handleInputChange}
                        >
                          <option value="weekly">Weekly</option>
                          <option value="fortnightly">Fortnightly</option>
                          <option value="monthly">Monthly</option>
                        </select>
                      </label>
                    </div>
                  ) : null}
                </>
              ) : null}

              <button className="primary-button" type="submit">
                {editingTransactionId ? 'Save changes' : 'Add transaction'}
              </button>
            </form>
          </>
        )}
      </section>
    </main>
  )
}

export default App
