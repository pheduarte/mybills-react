import { formatCurrency, formatShortDate } from '../../utils/formatters'

function getPermissionLabel(permission) {
  if (permission === 'granted') {
    return 'On'
  }

  if (permission === 'denied') {
    return 'Blocked'
  }

  if (permission === 'unsupported') {
    return 'Unavailable'
  }

  return 'Off'
}

function getSupportMessage({ isStandalone, isSupported, permission, settings }) {
  if (!isSupported) {
    return 'This browser cannot send app notifications.'
  }

  if (!isStandalone) {
    return 'Install MyBills to your iPhone Home Screen, then open it from there to enable notifications.'
  }

  if (permission === 'denied') {
    return 'Notifications are blocked in iOS Settings. Allow MyBills notifications there to turn reminders back on.'
  }

  if (permission === 'granted' && settings.enabled) {
    return 'MyBills will remind you while the Home Screen app is active or recently opened.'
  }

  return 'Tap Enable to allow reminders for unpaid bills before they are due.'
}

function NotificationSettings({
  isStandalone,
  isSupported,
  onRequestPermission,
  onSendTestNotification,
  permission,
  setSettings,
  settings,
  upcomingReminders,
}) {
  const canUseNotifications = isSupported && isStandalone && permission !== 'denied'
  const canToggle = permission === 'granted'

  return (
    <section className="notification-panel" aria-labelledby="notifications-title">
      <div className="notification-panel__header">
        <div>
          <p className="eyebrow">Due reminders</p>
          <h3 id="notifications-title">Notifications</h3>
        </div>
        <span className={`status-chip notification-status notification-status--${permission}`}>
          {getPermissionLabel(permission)}
        </span>
      </div>

      <p className="notification-panel__copy">
        {getSupportMessage({ isStandalone, isSupported, permission, settings })}
      </p>

      <div className="notification-panel__actions">
        {permission === 'granted' ? (
          <label className="switch-row">
            <input
              checked={settings.enabled}
              type="checkbox"
              onChange={(event) =>
                setSettings((currentSettings) => ({
                  ...currentSettings,
                  enabled: event.target.checked,
                }))
              }
            />
            <span>Reminder alerts</span>
          </label>
        ) : (
          <button
            className="primary-button notification-panel__button"
            type="button"
            disabled={!canUseNotifications}
            onClick={onRequestPermission}
          >
            Enable
          </button>
        )}

        <button
          className="ghost-button notification-panel__button"
          type="button"
          disabled={permission !== 'granted'}
          onClick={onSendTestNotification}
        >
          Test
        </button>
      </div>

      <div className="notification-controls">
        <label>
          Remind
          <select
            value={settings.leadDays}
            disabled={!canToggle}
            onChange={(event) =>
              setSettings((currentSettings) => ({
                ...currentSettings,
                leadDays: Number(event.target.value),
              }))
            }
          >
            <option value={0}>On due date</option>
            <option value={1}>1 day before</option>
            <option value={2}>2 days before</option>
            <option value={3}>3 days before</option>
            <option value={7}>1 week before</option>
          </select>
        </label>

        <label>
          Time
          <input
            type="time"
            value={settings.reminderTime}
            disabled={!canToggle}
            onChange={(event) =>
              setSettings((currentSettings) => ({
                ...currentSettings,
                reminderTime: event.target.value,
              }))
            }
          />
        </label>
      </div>

      <div className="notification-preview" aria-label="Upcoming reminder schedule">
        {upcomingReminders.length > 0 ? (
          upcomingReminders.map(({ transaction, reminderAt }) => (
            <div className="notification-preview__row" key={transaction.id}>
              <span>
                <strong>{transaction.title}</strong>
                <small>
                  {formatShortDate(transaction.date)} · {formatCurrency(transaction.amount, false)}
                </small>
              </span>
              <time dateTime={reminderAt.toISOString()}>
                {reminderAt.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
              </time>
            </div>
          ))
        ) : (
          <p className="notification-preview__empty">No unpaid bills scheduled.</p>
        )}
      </div>
    </section>
  )
}

export default NotificationSettings
