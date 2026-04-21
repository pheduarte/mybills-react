// This screen is reused while checking auth or loading the user's cloud data.
function LoadingPanel({ eyebrow, title, message }) {
  return (
    <main className="app-shell app-shell--centered">
      <section className="panel auth-panel auth-panel--compact">
        <p className="eyebrow">{eyebrow}</p>
        <h3>{title}</h3>
        <p className="auth-copy">{message}</p>
      </section>
    </main>
  )
}

export default LoadingPanel
