import { useState } from 'react'
import { formatCurrency, formatShortDate } from '../../utils/formatters'
import { getCategoryColor } from '../../utils/transactions'

// This component renders one category card at a time.
function CategoryCard({ group, hideAmounts, onEditTransaction, onTogglePaid }) {
  const [isExpanded, setIsExpanded] = useState(true)

  return (
    <article className={`category-card ${group.type}`} style={{ '--category-accent': getCategoryColor(group.category) }}>
      <header className="category-card__header">
        <button
          className="category-card__summary"
          type="button"
          onClick={() => setIsExpanded((currentValue) => !currentValue)}
          aria-expanded={isExpanded}
          aria-label={`${isExpanded ? 'Collapse' : 'Expand'} ${group.category} category`}
        >
          <div>
            <h3>{group.category}</h3>
          </div>

          <div className="category-card__summary-meta">
            <strong className={group.type === 'income' ? 'amount-positive' : 'amount-negative'}>
              {group.type === 'income' ? '+' : '-'}
              {formatCurrency(group.total, hideAmounts)}
            </strong>
            <span className="category-card__chevron" aria-hidden="true">
              {isExpanded ? '−' : '+'}
            </span>
          </div>
        </button>
      </header>

      {isExpanded ? (
        <div className="category-card__list">
          {group.transactions.map((transaction) => (
            <div className="transaction-row" key={transaction.id}>
              <button className="transaction-row__content" type="button" onClick={() => onEditTransaction(transaction)}>
                <strong>{transaction.title}</strong>
                <p>
                  {formatShortDate(transaction.date)}
                  {transaction.notes ? ` • ${transaction.notes}` : ''}
                  {transaction.seriesId ? ' • Recurring' : ''}
                </p>
              </button>

              <div className="transaction-row__meta">
                {transaction.type === 'expense' ? (
                  <>
                    <span className={`status-chip ${transaction.isPaid ? 'paid' : 'unpaid'}`}>
                      {transaction.isPaid ? 'Paid' : 'Not paid'}
                    </span>
                    <button
                      className={`ghost-button transaction-row__action ${
                        transaction.isPaid ? 'transaction-row__action--paid' : ''
                      }`}
                      type="button"
                      onClick={() => onTogglePaid(transaction.id)}
                    >
                      {transaction.isPaid ? 'Unpaid' : 'Pay'}
                    </button>
                  </>
                ) : null}
                <span className={transaction.type === 'income' ? 'amount-positive' : 'amount-negative'}>
                  {transaction.type === 'income' ? '+' : '-'}
                  {formatCurrency(transaction.amount, hideAmounts)}
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : null}
    </article>
  )
}

export default CategoryCard
