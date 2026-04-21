import { formatCurrency } from '../../utils/formatters'

// This small presentational component keeps our stat cards consistent.
function SummaryStat({ label, value, tone, hideAmounts }) {
  return (
    <div className="summary-stat">
      <span className={`summary-icon ${tone}`}>{tone === 'income' ? '+' : tone === 'expense' ? '-' : '='}</span>
      <div>
        <p className="summary-label">{label}</p>
        <strong>{formatCurrency(value, hideAmounts)}</strong>
      </div>
    </div>
  )
}

export default SummaryStat
