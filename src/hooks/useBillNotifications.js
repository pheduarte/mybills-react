import { useEffect, useMemo, useRef, useState } from 'react'
import { NOTIFICATION_SENT_STORAGE_KEY, NOTIFICATION_SETTINGS_STORAGE_KEY } from '../constants/appConstants'
import { formatCurrency, formatShortDate } from '../utils/formatters'

const DEFAULT_NOTIFICATION_SETTINGS = {
  enabled: false,
  leadDays: 1,
  reminderTime: '09:00',
}

const MAX_TIMEOUT_DELAY = 2_147_483_647

function getInitialNotificationSettings() {
  try {
    const storedSettings = JSON.parse(localStorage.getItem(NOTIFICATION_SETTINGS_STORAGE_KEY))

    return {
      ...DEFAULT_NOTIFICATION_SETTINGS,
      ...storedSettings,
      leadDays: Number(storedSettings?.leadDays ?? DEFAULT_NOTIFICATION_SETTINGS.leadDays),
    }
  } catch {
    return DEFAULT_NOTIFICATION_SETTINGS
  }
}

function getInitialPermission() {
  return 'Notification' in window ? Notification.permission : 'unsupported'
}

function getSentNotificationKeys() {
  try {
    const storedKeys = JSON.parse(localStorage.getItem(NOTIFICATION_SENT_STORAGE_KEY))

    return Array.isArray(storedKeys) ? storedKeys : []
  } catch {
    return []
  }
}

function setSentNotificationKeys(keys) {
  localStorage.setItem(NOTIFICATION_SENT_STORAGE_KEY, JSON.stringify(keys.slice(-160)))
}

function getStandaloneStatus() {
  return window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true
}

function getReminderDate(transactionDate, leadDays, reminderTime) {
  const [hour, minute] = reminderTime.split(':').map(Number)
  const reminderDate = new Date(`${transactionDate}T00:00:00`)

  reminderDate.setDate(reminderDate.getDate() - leadDays)
  reminderDate.setHours(hour, minute, 0, 0)

  return reminderDate
}

function getEndOfDueDate(transactionDate) {
  const dueDate = new Date(`${transactionDate}T23:59:59`)

  return dueDate
}

function formatLeadTime(leadDays) {
  if (leadDays === 0) {
    return 'today'
  }

  if (leadDays === 1) {
    return 'tomorrow'
  }

  return `in ${leadDays} days`
}

function getNotificationBody(transaction, settings) {
  const amount = formatCurrency(transaction.amount, false)
  const leadLabel = formatLeadTime(settings.leadDays)

  return `${transaction.title} is due ${leadLabel} (${formatShortDate(transaction.date)}) for ${amount}.`
}

async function getServiceWorkerRegistration() {
  if (!('serviceWorker' in navigator)) {
    return null
  }

  return navigator.serviceWorker.ready
}

async function showBillNotification(transaction, settings) {
  const registration = await getServiceWorkerRegistration()
  const title = settings.leadDays === 0 ? 'Bill due today' : 'Bill coming up'

  if (registration?.showNotification) {
    await registration.showNotification(title, {
      body: getNotificationBody(transaction, settings),
      badge: '/pwa-192.png',
      icon: '/pwa-192.png',
      tag: `mybills-${transaction.id}-${transaction.date}`,
      renotify: false,
      data: {
        url: '/',
        transactionId: transaction.id,
      },
    })
    return
  }

  if ('Notification' in window) {
    new Notification(title, {
      body: getNotificationBody(transaction, settings),
      icon: '/pwa-192.png',
      tag: `mybills-${transaction.id}-${transaction.date}`,
    })
  }
}

function getNotificationCandidates(transactions, settings) {
  return transactions
    .filter((transaction) => transaction.type === 'expense' && !transaction.isPaid && transaction.date)
    .map((transaction) => ({
      transaction,
      dueAt: new Date(`${transaction.date}T00:00:00`),
      reminderAt: getReminderDate(transaction.date, settings.leadDays, settings.reminderTime),
    }))
    .sort((left, right) => left.reminderAt.getTime() - right.reminderAt.getTime())
}

export function useBillNotifications(transactions) {
  const [settings, setSettings] = useState(getInitialNotificationSettings)
  const [permission, setPermission] = useState(getInitialPermission)
  const [isStandalone, setIsStandalone] = useState(getStandaloneStatus)
  const timeoutIdsRef = useRef([])

  const isSupported = permission !== 'unsupported' && 'serviceWorker' in navigator
  const upcomingReminders = useMemo(
    () =>
      getNotificationCandidates(transactions, settings)
        .filter(({ dueAt }) => dueAt >= new Date(new Date().toDateString()))
        .slice(0, 5),
    [settings, transactions],
  )

  useEffect(() => {
    localStorage.setItem(NOTIFICATION_SETTINGS_STORAGE_KEY, JSON.stringify(settings))
  }, [settings])

  useEffect(() => {
    const displayModeQuery = window.matchMedia('(display-mode: standalone)')
    const handleDisplayModeChange = () => setIsStandalone(getStandaloneStatus())

    displayModeQuery.addEventListener('change', handleDisplayModeChange)

    return () => {
      displayModeQuery.removeEventListener('change', handleDisplayModeChange)
    }
  }, [])

  useEffect(() => {
    timeoutIdsRef.current.forEach((timeoutId) => window.clearTimeout(timeoutId))
    timeoutIdsRef.current = []

    async function updateBadge() {
      if (!('setAppBadge' in navigator) || !('clearAppBadge' in navigator)) {
        return
      }

      const today = new Date(new Date().toDateString())
      const dueSoonCount = transactions.filter((transaction) => {
        if (transaction.type !== 'expense' || transaction.isPaid) {
          return false
        }

        const dueDate = new Date(`${transaction.date}T00:00:00`)
        const daysUntilDue = Math.ceil((dueDate.getTime() - today.getTime()) / 86_400_000)

        return daysUntilDue >= 0 && daysUntilDue <= settings.leadDays
      }).length

      try {
        if (dueSoonCount > 0 && settings.enabled && permission === 'granted') {
          await navigator.setAppBadge(dueSoonCount)
        } else {
          await navigator.clearAppBadge()
        }
      } catch {
        // Badge support is optional across browsers, so reminders should keep working without it.
      }
    }

    updateBadge()

    if (!settings.enabled || permission !== 'granted') {
      return undefined
    }

    const sentKeys = new Set(getSentNotificationKeys())
    const now = new Date()

    getNotificationCandidates(transactions, settings).forEach(({ transaction, reminderAt }) => {
      const sentKey = `${transaction.id}:${transaction.date}:${settings.leadDays}:${settings.reminderTime}`
      const endOfDueDate = getEndOfDueDate(transaction.date)

      if (sentKeys.has(sentKey) || now > endOfDueDate) {
        return
      }

      const scheduleNotification = () => {
        showBillNotification(transaction, settings)
          .then(() => {
            sentKeys.add(sentKey)
            setSentNotificationKeys([...sentKeys])
          })
          .catch(() => {
            // Permission or platform state can change after scheduling.
          })
      }

      const delay = reminderAt.getTime() - now.getTime()

      if (delay <= 0) {
        const timeoutId = window.setTimeout(scheduleNotification, 1200)
        timeoutIdsRef.current.push(timeoutId)
      } else if (delay <= MAX_TIMEOUT_DELAY) {
        const timeoutId = window.setTimeout(scheduleNotification, delay)
        timeoutIdsRef.current.push(timeoutId)
      }
    })

    return () => {
      timeoutIdsRef.current.forEach((timeoutId) => window.clearTimeout(timeoutId))
      timeoutIdsRef.current = []
    }
  }, [permission, settings, transactions])

  async function requestPermission() {
    if (!isSupported) {
      return 'unsupported'
    }

    await getServiceWorkerRegistration()
    const nextPermission = await Notification.requestPermission()

    setPermission(nextPermission)

    if (nextPermission === 'granted') {
      setSettings((currentSettings) => ({
        ...currentSettings,
        enabled: true,
      }))
    }

    return nextPermission
  }

  async function sendTestNotification() {
    if (permission !== 'granted') {
      return
    }

    await showBillNotification(
      {
        id: 'test',
        title: 'MyBills reminders',
        amount: 0,
        date: new Date().toISOString().slice(0, 10),
      },
      {
        ...settings,
        leadDays: 0,
      },
    )
  }

  return {
    isStandalone,
    isSupported,
    permission,
    requestPermission,
    sendTestNotification,
    setSettings,
    settings,
    upcomingReminders,
  }
}
