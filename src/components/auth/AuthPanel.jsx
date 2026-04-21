// This auth panel keeps sign in and account creation in a single small flow.
function AuthPanel({
  authMode,
  authForm,
  authError,
  isAuthSubmitting,
  onAuthFormChange,
  onAuthSubmit,
  onModeChange,
}) {
  return (
    <main className="app-shell app-shell--centered">
      <section className="panel auth-panel">
        <div>
          <p className="eyebrow">Cloud sync</p>
          <h3>{authMode === 'signin' ? 'Sign in to MyBills' : 'Create your MyBills account'}</h3>
        </div>

        <p className="auth-copy">
          Sign in to keep your bills, recurring expenses, and installments synced across all your devices.
        </p>

        <form className="transaction-form" onSubmit={onAuthSubmit}>
          <label>
            Email
            <input
              autoComplete="email"
              name="email"
              type="email"
              placeholder="you@example.com"
              value={authForm.email}
              onChange={onAuthFormChange}
            />
          </label>

          <label>
            Password
            <input
              autoComplete={authMode === 'signin' ? 'current-password' : 'new-password'}
              name="password"
              type="password"
              placeholder="At least 6 characters"
              value={authForm.password}
              onChange={onAuthFormChange}
            />
          </label>

          {authError ? <p className="auth-error">{authError}</p> : null}

          <button className="primary-button" disabled={isAuthSubmitting} type="submit">
            {isAuthSubmitting ? 'Please wait...' : authMode === 'signin' ? 'Sign in' : 'Create account'}
          </button>
        </form>

        <button
          className="auth-switch"
          type="button"
          onClick={() => onModeChange(authMode === 'signin' ? 'signup' : 'signin')}
        >
          {authMode === 'signin' ? 'Need an account? Create one' : 'Already have an account? Sign in'}
        </button>
      </section>
    </main>
  )
}

export default AuthPanel
