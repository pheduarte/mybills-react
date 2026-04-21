// This bottom composer stays visible and expands into the full form when tapped.
function TransactionComposer({
  categoryOptions,
  editingTransaction,
  editingTransactionId,
  formState,
  isEntryOpen,
  onClose,
  onDeleteTransaction,
  onInputChange,
  onOpen,
  onSaveTransaction,
  setFormState,
}) {
  if (!isEntryOpen) {
    return (
      <section className="panel composer composer--closed">
        <button className="composer-trigger" type="button" onClick={onOpen}>
          <span className="composer-trigger__label">Add new entry</span>
          <span className="composer-trigger__placeholder">Tap to add income or expense...</span>
        </button>
      </section>
    )
  }

  return (
    <section className="panel composer composer--open">
      <div className="panel__title">
        <div>
          <p className="eyebrow">{editingTransactionId ? 'Edit entry' : 'Add new entry'}</p>
          <h3>{editingTransactionId ? 'Update transaction' : 'Income and expenses'}</h3>
        </div>

        <div className="composer-actions">
          <span className="chip chip--cloud">Cloud sync</span>
          <button className="ghost-button" type="button" onClick={onClose}>
            X
          </button>
        </div>
      </div>

      <form className="transaction-form" onSubmit={onSaveTransaction}>
        <label>
          Title
          <input
            name="title"
            type="text"
            placeholder="Rent, Salary, Internet..."
            value={formState.title}
            onChange={onInputChange}
          />
        </label>

        <div className="form-row">
          <label>
            Type
            <select name="type" value={formState.type} onChange={onInputChange}>
              <option value="expense">Expense</option>
              <option value="income">Income</option>
            </select>
          </label>

          <label>
            Amount
            <input
              name="amount"
              type="number"
              min="0"
              step="0.01"
              placeholder="0.00"
              value={formState.amount}
              onChange={onInputChange}
            />
          </label>
        </div>

        <div className="form-row">
          <label>
            Date
            <input name="date" type="date" value={formState.date} onChange={onInputChange} />
          </label>

          <label>
            Category
            <input
              list="category-suggestions"
              name="category"
              type="text"
              placeholder="House"
              value={formState.category}
              onChange={onInputChange}
            />
            <datalist id="category-suggestions">
              {categoryOptions.map((category) => (
                <option key={category} value={category} />
              ))}
            </datalist>
          </label>
        </div>

        <label>
          Notes
          <input
            name="notes"
            type="text"
            placeholder="Installment 2 of 5, Streaming, Pay cycle..."
            value={formState.notes}
            onChange={onInputChange}
          />
        </label>

        {!editingTransactionId ? (
          <>
            <label className="checkbox-row">
              <input
                checked={formState.isRecurring}
                name="isRecurring"
                type="checkbox"
                onChange={(event) =>
                  setFormState((currentForm) => ({
                    ...currentForm,
                    isRecurring: event.target.checked,
                    isInstallment: event.target.checked ? false : currentForm.isInstallment,
                  }))
                }
              />
              <span>{formState.type === 'income' ? 'Recurring' : 'Fixed'}</span>
            </label>

            {formState.isRecurring ? (
              <label>
                Recurring frequency
                <select name="recurringFrequency" value={formState.recurringFrequency} onChange={onInputChange}>
                  <option value="weekly">Weekly</option>
                  <option value="fortnightly">Fortnightly</option>
                  <option value="monthly">Monthly</option>
                </select>
              </label>
            ) : null}

            {formState.type === 'expense' ? (
              <label className="checkbox-row">
                <input
                  checked={formState.isInstallment}
                  name="isInstallment"
                  type="checkbox"
                  onChange={(event) =>
                    setFormState((currentForm) => ({
                      ...currentForm,
                      isInstallment: event.target.checked,
                      isRecurring: event.target.checked ? false : currentForm.isRecurring,
                    }))
                  }
                />
                <span>Instalments</span>
              </label>
            ) : null}

            {formState.type === 'expense' && formState.isInstallment ? (
              <div className="form-row">
                <label>
                  Payments
                  <select name="installmentCount" value={formState.installmentCount} onChange={onInputChange}>
                    {Array.from({ length: 23 }, (_, index) => String(index + 2)).map((count) => (
                      <option key={count} value={count}>
                        {count} payments
                      </option>
                    ))}
                  </select>
                </label>

                <label>
                  Frequency
                  <select
                    name="installmentFrequency"
                    value={formState.installmentFrequency}
                    onChange={onInputChange}
                  >
                    <option value="weekly">Weekly</option>
                    <option value="fortnightly">Fortnightly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                </label>
              </div>
            ) : null}
          </>
        ) : null}

        <button className="primary-button" type="submit">
          {editingTransactionId ? 'Save changes' : 'Add transaction'}
        </button>

        {editingTransaction ? (
          <button className="secondary-delete-button" type="button" onClick={() => onDeleteTransaction(editingTransaction)}>
            Delete transaction
          </button>
        ) : null}
      </form>
    </section>
  )
}

export default TransactionComposer
