import { formatCurrency, formatMonthLabel, formatShortDate } from '../../utils/formatters'
import { getCategoryColor } from '../../utils/transactions'

// This tab lets users set category limits and see paid expenses consuming them.
function BudgetManagementSection({ budgetRows, hideAmounts, selectedMonth, onBudgetChange }) {
  const totalBudget = budgetRows.reduce((total, row) => total + row.budget, 0)
  const totalPaid = budgetRows.reduce((total, row) => total + row.paidTotal, 0)
  const totalRemaining = totalBudget - totalPaid

  return (
    <section className="budget-section">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Budget management</p>
          <h3>{formatMonthLabel(selectedMonth)}</h3>
        </div>
        <span className="chip">{formatCurrency(totalRemaining, hideAmounts)} left</span>
      </div>

      <div className="budget-overview panel">
        <div>
          <p className="summary-label">Monthly budget</p>
          <strong>{formatCurrency(totalBudget, hideAmounts)}</strong>
        </div>
        <div>
          <p className="summary-label">Paid expenses</p>
          <strong className="amount-negative">{formatCurrency(totalPaid, hideAmounts)}</strong>
        </div>
        <div>
          <p className="summary-label">Remaining</p>
          <strong className={totalRemaining >= 0 ? 'amount-positive' : 'amount-negative'}>
            {formatCurrency(totalRemaining, hideAmounts)}
          </strong>
        </div>
      </div>

      <div className="budget-grid">
        {budgetRows.map((row) => (
          <article
            className={`budget-card ${row.remaining < 0 ? 'budget-card--over' : ''}`}
            key={row.category}
            style={{ '--category-accent': getCategoryColor(row.category) }}
          >
            <div className="budget-card__header">
              <div>
                <p className="eyebrow">Category</p>
                <h3>{row.category}</h3>
              </div>
              <label className="budget-input">
                <span>Limit</span>
                <input
                  min="0"
                  inputMode="decimal"
                  type={hideAmounts ? 'password' : 'number'}
                  value={row.budget === 0 ? '' : row.budget}
                  placeholder="0"
                  onChange={(event) => onBudgetChange(row.category, event.target.value)}
                />
              </label>
            </div>

            <div className="budget-progress" aria-hidden="true">
              <span style={{ width: `${row.usage}%` }} />
            </div>

            <div className="budget-card__stats">
              <span>
                Paid <strong>{formatCurrency(row.paidTotal, hideAmounts)}</strong>
              </span>
              <span>
                Left{' '}
                <strong className={row.remaining >= 0 ? 'amount-positive' : 'amount-negative'}>
                  {formatCurrency(row.remaining, hideAmounts)}
                </strong>
              </span>
            </div>

            {row.paidTransactions.length > 0 ? (
              <div className="budget-card__payments">
                {row.paidTransactions.slice(0, 3).map((transaction) => (
                  <div className="budget-payment" key={transaction.id}>
                    <span>{transaction.title}</span>
                    <strong>{formatCurrency(transaction.amount, hideAmounts)}</strong>
                    <small>{formatShortDate(transaction.date)}</small>
                  </div>
                ))}
              </div>
            ) : (
              <p className="budget-card__empty">No paid expenses yet.</p>
            )}
          </article>
        ))}
      </div>
    </section>
  )
}

export default BudgetManagementSection
