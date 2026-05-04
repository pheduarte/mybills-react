import CategoryCard from './CategoryCard'
import { formatMonthLabel } from '../../utils/formatters'
import { useState } from 'react'

// This final section renders each category as its own modern card.
function CategoriesSection({
  categoryGroups,
  hideAmounts,
  selectedMonth,
  onEditTransaction,
  onReorderCategory,
  onTogglePaid,
}) {
  const [draggedCategory, setDraggedCategory] = useState('')
  const [dropTarget, setDropTarget] = useState(null)

  function handleDragStart(event, category) {
    setDraggedCategory(category)
    event.dataTransfer.effectAllowed = 'move'
    event.dataTransfer.setData('text/plain', category)
  }

  function handleDragOver(event, category) {
    event.preventDefault()

    if (!draggedCategory || draggedCategory === category) {
      setDropTarget(null)
      return
    }

    const targetRect = event.currentTarget.getBoundingClientRect()
    const isAfterHorizontalMidpoint = event.clientX > targetRect.left + targetRect.width / 2
    const isAfterVerticalMidpoint = event.clientY > targetRect.top + targetRect.height / 2
    const position = isAfterHorizontalMidpoint || isAfterVerticalMidpoint ? 'after' : 'before'

    event.dataTransfer.dropEffect = 'move'
    setDropTarget({ category, position })
  }

  function resetDragState() {
    setDraggedCategory('')
    setDropTarget(null)
  }

  function handleDrop(event, category) {
    event.preventDefault()

    const sourceCategory = event.dataTransfer.getData('text/plain') || draggedCategory

    if (sourceCategory && sourceCategory !== category) {
      onReorderCategory(sourceCategory, category, dropTarget?.position ?? 'before')
    }

    resetDragState()
  }

  return (
    <section className="categories-section">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Monthly breakdown</p>
          <h3>Categories</h3>
        </div>
        <span className="chip">{categoryGroups.length} groups</span>
      </div>

      {categoryGroups.length > 0 ? (
        <div className="categories-grid">
          {categoryGroups.map((group) => (
            <CategoryCard
              dragPosition={dropTarget?.category === group.category ? dropTarget.position : ''}
              draggableCategory={draggedCategory}
              group={group}
              hideAmounts={hideAmounts}
              key={group.category}
              onDragEnd={resetDragState}
              onDragOver={handleDragOver}
              onDragStart={handleDragStart}
              onDrop={handleDrop}
              onEditTransaction={onEditTransaction}
              onTogglePaid={onTogglePaid}
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
