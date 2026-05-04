import { useEffect, useState } from 'react'
import { getDoc, serverTimestamp, setDoc } from 'firebase/firestore'
import { BUDGET_STORAGE_KEY, STORAGE_KEY } from '../constants/appConstants'
import { db } from '../firebase'
import { getUserDataDoc } from '../utils/firestore'
import { getInitialBudgets, getInitialTransactions } from '../utils/storage'

// This hook keeps Firestore loading and syncing separate from the UI rendering code.
export function useTransactionsSync(user) {
  const [budgets, setBudgets] = useState({})
  const [transactions, setTransactions] = useState([])
  const [isDataLoading, setIsDataLoading] = useState(false)
  const [hasLoadedRemoteData, setHasLoadedRemoteData] = useState(false)
  const [syncError, setSyncError] = useState('')

  // This effect loads the signed-in user's data from Firestore.
  useEffect(() => {
    let isCancelled = false

    async function loadUserData() {
      if (!user || !db) {
        setBudgets({})
        setTransactions([])
        setIsDataLoading(false)
        setHasLoadedRemoteData(false)
        setSyncError('')
        return
      }

      setIsDataLoading(true)
      setHasLoadedRemoteData(false)
      setSyncError('')

      try {
        const userDataRef = getUserDataDoc(user.uid)
        const snapshot = await getDoc(userDataRef)
        const fallbackTransactions = getInitialTransactions()
        const fallbackBudgets = getInitialBudgets()
        const nextTransactions =
          snapshot.exists() && Array.isArray(snapshot.data().transactions)
            ? snapshot.data().transactions
            : fallbackTransactions
        const nextBudgets =
          snapshot.exists() && snapshot.data().budgets && typeof snapshot.data().budgets === 'object'
            ? snapshot.data().budgets
            : fallbackBudgets

        if (!snapshot.exists()) {
          await setDoc(
            userDataRef,
            {
              budgets: nextBudgets,
              transactions: nextTransactions,
              email: user.email ?? '',
              updatedAt: serverTimestamp(),
            },
            { merge: true },
          )

          // Once we migrate local data into Firestore, we no longer need the device-only copy.
          localStorage.removeItem(BUDGET_STORAGE_KEY)
          localStorage.removeItem(STORAGE_KEY)
        }

        if (!isCancelled) {
          setBudgets(nextBudgets)
          setTransactions(nextTransactions)
          setHasLoadedRemoteData(true)
        }
      } catch {
        if (!isCancelled) {
          setBudgets(getInitialBudgets())
          setTransactions(getInitialTransactions())
          setHasLoadedRemoteData(true)
          setSyncError('We could not load your cloud data right now. Please try again.')
        }
      } finally {
        if (!isCancelled) {
          setIsDataLoading(false)
        }
      }
    }

    loadUserData()

    return () => {
      isCancelled = true
    }
  }, [user])

  // This effect keeps Firestore updated after the initial user data has loaded.
  useEffect(() => {
    if (!user || !db || !hasLoadedRemoteData) {
      return undefined
    }

    const syncTimeout = window.setTimeout(async () => {
      try {
        await setDoc(
          getUserDataDoc(user.uid),
          {
            transactions,
            budgets,
            email: user.email ?? '',
            updatedAt: serverTimestamp(),
          },
          { merge: true },
        )
        setSyncError('')
      } catch {
        setSyncError('Your latest changes could not be synced right now.')
      }
    }, 300)

    return () => {
      window.clearTimeout(syncTimeout)
    }
  }, [budgets, transactions, user, hasLoadedRemoteData])

  return {
    budgets,
    hasLoadedRemoteData,
    isDataLoading,
    setBudgets,
    setTransactions,
    syncError,
    transactions,
  }
}
