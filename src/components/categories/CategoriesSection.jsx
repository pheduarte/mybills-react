import CategoryCard from './CategoryCard'
import { formatMonthLabel } from '../../utils/formatters'

// This final section renders each category as its own modern card.
function CategoriesSection({ categoryGroups, hideAmounts, selectedMonth, onEditTransaction }) {
  return (
    <section className="categories-section">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Monthly breakdown</p>
          <h3>Category cards</h3>
        </div>
        <span className="chip">{categoryGroups.length} groups</span>
      </div>

      {categoryGroups.length > 0 ? (
        <div className="categories-grid">
          {categoryGroups.map((group) => (
            <CategoryCard
              group={group}
              hideAmounts={hideAmounts}
              key={group.category}
              onEditTransaction={onEditTransaction}
            />
          ))}
        </div>
      ) : (
        <div className="panel empty-state">
          <strong>This month is empty</strong>
          <p>Use the form to add your first income or expense for {formatMonthLabel(selectedMonth)}.</p>
        </div>
      )}
    </section>
  )
}

export default CategoriesSection
