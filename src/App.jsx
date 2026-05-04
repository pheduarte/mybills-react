import { useEffect, useState } from 'react'
import './App.css'
import AuthPanel from './components/auth/AuthPanel'
import FirebaseSetupPanel from './components/auth/FirebaseSetupPanel'
import LoadingPanel from './components/auth/LoadingPanel'
import BudgetManagementSection from './components/budget/BudgetManagementSection'
import CategoriesSection from './components/categories/CategoriesSection'
import TransactionComposer from './components/composer/TransactionComposer'
import HeroCard from './components/dashboard/HeroCard'
import { CATEGORY_ORDER_STORAGE_KEY, CATEGORY_SUGGESTIONS, MONTH_STORAGE_KEY } from './constants/appConstants'
import { useAuthSession } from './hooks/useAuthSession'
import { useTransactionsSync } from './hooks/useTransactionsSync'
import { isFirebaseConfigured } from './firebase'
import { getDefaultDateForMonth, getMonthKey, shiftMonth } from './utils/date'
import { createBudgetRows, getBudgetCategories } from './utils/budgets'
import { groupTransactionsByCategory } from './utils/transactions'
import {
  createEmptyForm,
  createInstallmentTransactions,
  createRecurringTransactions,
  sortTransactions,
  sumAmounts,
} from './utils/transactions'
import { getInitialCategoryOrder, getInitialMonth } from './utils/storage'

const THEME_STORAGE_KEY = 'mybills-theme-v1'

function App() {
  // This state tracks which month the dashboard should show.
  const [selectedMonth, setSelectedMonth] = useState(getInitialMonth)

  // This state stores whether the interface should use the light or dark palette.
  const [theme, setTheme] = useState(() => localStorage.getItem(THEME_STORAGE_KEY) ?? 'light')

  // This state lets the user hide balances when sharing the screen.
  const [hideAmounts, setHideAmounts] = useState(false)

  // This state controls whether the bottom add-entry composer is open.
  const [isEntryOpen, setIsEntryOpen] = useState(false)

  // This state switches between the monthly breakdown and budget management views.
  const [activeTab, setActiveTab] = useState('breakdown')

  // This state remembers the user's preferred category card order.
  const [categoryOrder, setCategoryOrder] = useState(getInitialCategoryOrder)

  // This state tracks whether the bottom composer is editing an existing transaction.
  const [editingTransactionId, setEditingTransactionId] = useState(null)

  // This state controls the add-transaction form inputs.
  const [formState, setFormState] = useState(() => createEmptyForm(getInitialMonth()))

  // This hook owns the Firebase Authentication flow and session state.
  function handleSignedOutState() {
    setEditingTransactionId(null)
    setFormState(createEmptyForm(getInitialMonth()))
    setIsEntryOpen(false)
  }

  const {
    authError,
    authForm,
    authMode,
    handleAuthFormChange,
    handleAuthSubmit,
    handleSignOut,
    isAuthLoading,
    isAuthSubmitting,
    setAuthMode,
    user,
  } = useAuthSession({ onSignedOut: handleSignedOutState })

  // This hook loads and syncs transactions to Firestore.
  const { budgets, hasLoadedRemoteData, isDataLoading, setBudgets, setTransactions, syncError, transactions } =
    useTransactionsSync(user)

  // This effect remembers the month the user viewed last.
  useEffect(() => {
    localStorage.setItem(MONTH_STORAGE_KEY, selectedMonth)
  }, [selectedMonth])

  // This effect remembers the custom card order between visits.
  useEffect(() => {
    localStorage.setItem(CATEGORY_ORDER_STORAGE_KEY, JSON.stringify(categoryOrder))
  }, [categoryOrder])

  // This effect applies the chosen theme across the whole app, including auth screens.
  useEffect(() => {
    document.documentElement.dataset.theme = theme
    localStorage.setItem(THEME_STORAGE_KEY, theme)
  }, [theme])

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
  const orderedCategoryGroups = [...categoryGroups].sort((left, right) => {
    const leftIndex = categoryOrder.indexOf(left.category)
    const rightIndex = categoryOrder.indexOf(right.category)

    if (leftIndex === -1 && rightIndex === -1) {
      return 0
    }

    if (leftIndex === -1) {
      return 1
    }

    if (rightIndex === -1) {
      return -1
    }

    return leftIndex - rightIndex
  })

  // This derived list feeds the category suggestion menu while still allowing new values.
  const categoryOptions = [...new Set([...CATEGORY_SUGGESTIONS, ...transactions.map((item) => item.category)])].sort(
    (left, right) => left.localeCompare(right),
  )

  // This derived list powers the budget editor using visible and suggested expense categories.
  const budgetCategories = getBudgetCategories(categoryGroups, categoryOptions)
  const selectedMonthBudgets = budgets[selectedMonth] ?? {}
  const budgetRows = createBudgetRows(budgetCategories, monthTransactions, selectedMonthBudgets)

  // This is used to draw the split bar between income and expense totals.
  const cashFlowTotal = totalIncome + totalExpenses
  const incomeShare = cashFlowTotal === 0 ? 50 : (totalIncome / cashFlowTotal) * 100

  // This derived item gives the composer access to the transaction currently being edited.
  const editingTransaction = transactions.find((transaction) => transaction.id === editingTransactionId) ?? null

  // This helper restores the composer to its default add-entry state.
  function resetComposer(monthKey = selectedMonth) {
    setEditingTransactionId(null)
    setFormState(createEmptyForm(monthKey))
    setIsEntryOpen(false)
  }

  // This handler confirms or reopens a payment directly from a category row.
  function handleTogglePaid(transactionId) {
    setTransactions((currentTransactions) =>
      currentTransactions.map((transaction) =>
        transaction.id === transactionId
          ? {
              ...transaction,
              isPaid: !transaction.isPaid,
            }
          : transaction,
      ),
    )
  }

  // This handler moves one category card before or after another card.
  function handleReorderCategory(sourceCategory, targetCategory, position = 'before') {
    if (sourceCategory === targetCategory) {
      return
    }

    const visibleCategories = categoryGroups.map((group) => group.category)

    setCategoryOrder((currentOrder) => {
      const orderedVisibleCategories = [
        ...currentOrder.filter((category) => visibleCategories.includes(category)),
        ...visibleCategories.filter((category) => !currentOrder.includes(category)),
      ]
      const sourceIndex = orderedVisibleCategories.indexOf(sourceCategory)
      const targetIndex = orderedVisibleCategories.indexOf(targetCategory)

      if (sourceIndex === -1 || targetIndex === -1) {
        return currentOrder
      }

      const nextVisibleCategories = [...orderedVisibleCategories]
      const [movedCategory] = nextVisibleCategories.splice(sourceIndex, 1)
      const nextTargetIndex = nextVisibleCategories.indexOf(targetCategory)
      const insertionIndex = position === 'after' ? nextTargetIndex + 1 : nextTargetIndex
      nextVisibleCategories.splice(insertionIndex, 0, movedCategory)

      return [
        ...nextVisibleCategories,
        ...currentOrder.filter((category) => !visibleCategories.includes(category)),
      ]
    })
  }

  // This handler updates the selected month's limit for one category.
  function handleBudgetAmountChange(category, value) {
    const amount = Number(value)

    if (value !== '' && (Number.isNaN(amount) || amount < 0)) {
      return
    }

    setBudgets((currentBudgets) => {
      const currentMonthBudgets = currentBudgets[selectedMonth] ?? {}
      const nextMonthBudgets = { ...currentMonthBudgets }

      if (value === '') {
        delete nextMonthBudgets[category]
      } else {
        nextMonthBudgets[category] = amount
      }

      return {
        ...currentBudgets,
        [selectedMonth]: nextMonthBudgets,
      }
    })
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
      isPaid: false,
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
        ...createRecurringTransactions(
          {
            ...nextTransaction,
            type: 'expense',
          },
          formState.recurringFrequency,
        ),
      ])
    } else if (formState.type === 'income' && formState.isRecurring) {
      setTransactions((currentTransactions) => [
        ...currentTransactions,
        ...createRecurringTransactions(
          {
            ...nextTransaction,
            type: 'income',
          },
          formState.recurringFrequency,
        ),
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
      recurringFrequency: 'monthly',
      isInstallment: false,
      installmentCount: '3',
      installmentFrequency: 'monthly',
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

  if (!isFirebaseConfigured) {
    return <FirebaseSetupPanel />
  }

  if (isAuthLoading) {
    return (
      <LoadingPanel
        eyebrow="Checking session"
        title="Loading MyBills"
        message="Connecting to Firebase Authentication..."
      />
    )
  }

  if (!user) {
    return (
      <AuthPanel
        authError={authError}
        authForm={authForm}
        authMode={authMode}
        isAuthSubmitting={isAuthSubmitting}
        onAuthFormChange={handleAuthFormChange}
        onAuthSubmit={handleAuthSubmit}
        onModeChange={setAuthMode}
      />
    )
  }

  if (isDataLoading && !hasLoadedRemoteData) {
    return (
      <LoadingPanel
        eyebrow="Cloud sync"
        title="Loading your bills"
        message="Fetching your transactions from Firestore..."
      />
    )
  }

  return (
    <main className="app-shell">
      {/* This top area acts like a simple mobile app header. */}
      <header className="topbar">
        <div>
          <h1>MyBills</h1>
        </div>

        <div className="topbar__actions">
          <button
            className="chip theme-chip"
            type="button"
            onClick={() => setTheme((currentTheme) => (currentTheme === 'light' ? 'dark' : 'light'))}
            aria-label={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
            title={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
          >
            <span className="theme-chip__icon" aria-hidden="true">
              {theme === 'light' ? '☾' : '☀'}
            </span>
          </button>
          <button className="ghost-button ghost-button--session" type="button" onClick={handleSignOut}>
            Sign out
          </button>
          <button className="icon-button" type="button" onClick={() => setHideAmounts((currentValue) => !currentValue)}>
            {hideAmounts ? 'Show' : 'Hide'}
          </button>
        </div>
      </header>

      {syncError ? <p className="sync-banner">{syncError}</p> : null}

      <HeroCard
        balance={balance}
        hideAmounts={hideAmounts}
        incomeShare={incomeShare}
        selectedMonth={selectedMonth}
        totalExpenses={totalExpenses}
        totalIncome={totalIncome}
        onMonthChange={handleMonthChange}
      />

      <nav className="app-tabs" aria-label="Dashboard sections">
        <button
          className={`app-tab ${activeTab === 'breakdown' ? 'app-tab--active' : ''}`}
          type="button"
          onClick={() => setActiveTab('breakdown')}
        >
          Breakdown
        </button>
        <button
          className={`app-tab ${activeTab === 'budget' ? 'app-tab--active' : ''}`}
          type="button"
          onClick={() => setActiveTab('budget')}
        >
          Budget
        </button>
      </nav>

      {activeTab === 'breakdown' ? (
        <CategoriesSection
          categoryGroups={orderedCategoryGroups}
          hideAmounts={hideAmounts}
          selectedMonth={selectedMonth}
          onEditTransaction={handleEditTransaction}
          onReorderCategory={handleReorderCategory}
          onTogglePaid={handleTogglePaid}
        />
      ) : (
        <BudgetManagementSection
          budgetRows={budgetRows}
          hideAmounts={hideAmounts}
          selectedMonth={selectedMonth}
          onBudgetChange={handleBudgetAmountChange}
        />
      )}

      <TransactionComposer
        categoryOptions={categoryOptions}
        editingTransaction={editingTransaction}
        editingTransactionId={editingTransactionId}
        formState={formState}
        isEntryOpen={isEntryOpen}
        setFormState={setFormState}
        onClose={() => resetComposer()}
        onDeleteTransaction={handleDeleteTransaction}
        onInputChange={handleInputChange}
        onOpen={() => setIsEntryOpen(true)}
        onSaveTransaction={handleSaveTransaction}
      />
    </main>
  )
}

export default App
