import SummaryStat from './SummaryStat'
import { formatCurrency, formatMonthLabel } from '../../utils/formatters'
import { getBalanceLabel } from '../../utils/transactions'

// This hero card summarizes the selected month at a glance.
function HeroCard({
  balance,
  hideAmounts,
  incomeShare,
  selectedMonth,
  totalExpenses,
  totalIncome,
  onMonthChange,
}) {
  return (
    <section className="hero-card">
      <div className="hero-card__header">
        <div className="hero-card__month">
          <p className="eyebrow">Cashboard</p>
          <h2>{formatMonthLabel(selectedMonth)}</h2>
        </div>
      </div>

      <div className="hero-card__nav">
        <button className="icon-button icon-button--soft" type="button" onClick={() => onMonthChange(-1)}>
          Prev
        </button>

        <button className="icon-button icon-button--soft" type="button" onClick={() => onMonthChange(1)}>
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
  )
}

export default HeroCard
