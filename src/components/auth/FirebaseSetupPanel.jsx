import { missingFirebaseEnvKeys } from '../../firebase'

// This screen appears until Firebase is configured with real project credentials.
function FirebaseSetupPanel() {
  return (
    <main className="app-shell app-shell--centered">
      <section className="panel auth-panel">
        <p className="eyebrow">Firebase setup</p>
        <h3>Connect MyBills to Firebase</h3>
        <p className="auth-copy">
          Add your Firebase web app credentials to a local <code>.env</code> file and to Vercel environment
          variables before signing in.
        </p>

        <div className="setup-block">
          <strong>Missing variables</strong>
          <ul className="setup-list">
            {missingFirebaseEnvKeys.map((key) => (
              <li key={key}>{key}</li>
            ))}
          </ul>
        </div>

        <div className="setup-block">
          <strong>Firebase console checklist</strong>
          <p>Enable Email/Password sign-in in Authentication and create a Firestore database in production mode.</p>
        </div>
      </section>
    </main>
  )
}

export default FirebaseSetupPanel
