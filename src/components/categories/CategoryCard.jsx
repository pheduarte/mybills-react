import { formatCurrency, formatShortDate } from '../../utils/formatters'
import { getCategoryColor } from '../../utils/transactions'

// This component renders one category card at a time.
function CategoryCard({ group, hideAmounts, onEditTransaction }) {
  return (
    <article className={`category-card ${group.type}`} style={{ '--category-accent': getCategoryColor(group.category) }}>
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
            <button className="transaction-row__content" type="button" onClick={() => onEditTransaction(transaction)}>
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
            </div>
          </div>
        ))}
      </div>
    </article>
  )
}

export default CategoryCard
