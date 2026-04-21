import { formatCurrency, formatShortDate } from '../../utils/formatters'

// This section surfaces the next expenses in the selected month.
function UpcomingPaymentsSection({ hideAmounts, upcomingTransactions, onEditTransaction, onTogglePaid }) {
  return (
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
              <div className="upcoming-row__main">
                <button
                  className="transaction-row__content"
                  type="button"
                  onClick={() => onEditTransaction(transaction)}
                >
                  <strong>{transaction.title}</strong>
                  <p>
                    {transaction.category}
                    {transaction.notes ? ` • ${transaction.notes}` : ''}
                    {transaction.seriesId ? ' • Recurring' : ''}
                  </p>
                </button>

                <button
                  className={`ghost-button upcoming-row__action ${transaction.isPaid ? 'upcoming-row__action--paid' : ''}`}
                  type="button"
                  onClick={() => onTogglePaid(transaction.id)}
                >
                  {transaction.isPaid ? 'Mark unpaid' : 'Confirm payment'}
                </button>
              </div>

              <div className="upcoming-row__meta">
                <span className={`status-chip ${transaction.isPaid ? 'paid' : 'unpaid'}`}>
                  {transaction.isPaid ? 'Paid' : 'Not paid'}
                </span>
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
  )
}

export default UpcomingPaymentsSection
