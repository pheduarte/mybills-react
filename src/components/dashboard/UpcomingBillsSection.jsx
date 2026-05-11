import { formatCurrency, formatShortDate } from '../../utils/formatters'

function UpcomingBillsSection({ bills, hideAmounts, onEditTransaction, onTogglePaid }) {
  return (
    <section className="upcoming-section">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Next payments</p>
          <h3>Upcoming bills</h3>
        </div>
        <span className="chip">{bills.length} due</span>
      </div>

      <div className="panel upcoming-card">
        {bills.length > 0 ? (
          <div className="upcoming-list">
            {bills.map((bill) => (
              <div className="transaction-row upcoming-row" key={bill.id}>
                <button className="transaction-row__content" type="button" onClick={() => onEditTransaction(bill)}>
                  <strong>{bill.title}</strong>
                  <p>
                    {formatShortDate(bill.date)} • {bill.category}
                    {bill.notes ? ` • ${bill.notes}` : ''}
                  </p>
                </button>

                <div className="transaction-row__meta">
                  <button
                    className="ghost-button transaction-row__action"
                    type="button"
                    onClick={() => onTogglePaid(bill.id)}
                  >
                    Pay
                  </button>
                  <span className="amount-negative">-{formatCurrency(bill.amount, hideAmounts)}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <strong>No upcoming bills</strong>
            <p>Paid bills disappear from this list automatically.</p>
          </div>
        )}
      </div>
    </section>
  )
}

export default UpcomingBillsSection
