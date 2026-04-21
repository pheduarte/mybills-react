import { useEffect, useRef, useState } from 'react'
import { createUserWithEmailAndPassword, onAuthStateChanged, signInWithEmailAndPassword, signOut } from 'firebase/auth'
import { auth } from '../firebase'

// This hook keeps all Firebase Authentication logic in one place.
export function useAuthSession({ onSignedOut } = {}) {
  const [user, setUser] = useState(null)
  const [authMode, setAuthMode] = useState('signin')
  const [authForm, setAuthForm] = useState({ email: '', password: '' })
  const [authError, setAuthError] = useState('')
  const [isAuthLoading, setIsAuthLoading] = useState(Boolean(auth))
  const [isAuthSubmitting, setIsAuthSubmitting] = useState(false)
  const onSignedOutRef = useRef(onSignedOut)

  // This effect keeps the latest sign-out cleanup callback available to the auth listener.
  useEffect(() => {
    onSignedOutRef.current = onSignedOut
  }, [onSignedOut])

  // This effect listens for Firebase auth changes once on app start.
  useEffect(() => {
    if (!auth) {
      return undefined
    }

    const unsubscribe = onAuthStateChanged(auth, (nextUser) => {
      setUser(nextUser)
      setIsAuthLoading(false)
      setAuthError('')

      if (!nextUser) {
        onSignedOutRef.current?.()
      }
    })

    return unsubscribe
  }, [])

  // This handler updates the small Firebase auth form.
  function handleAuthFormChange(event) {
    const { name, value } = event.target

    setAuthForm((currentForm) => ({
      ...currentForm,
      [name]: value,
    }))
  }

  // This handler signs in or creates an account with Firebase email/password auth.
  async function handleAuthSubmit(event) {
    event.preventDefault()
    setAuthError('')
    setIsAuthSubmitting(true)

    try {
      if (authMode === 'signin') {
        await signInWithEmailAndPassword(auth, authForm.email.trim(), authForm.password)
      } else {
        await createUserWithEmailAndPassword(auth, authForm.email.trim(), authForm.password)
      }
    } catch (error) {
      setAuthError(error.message ?? 'Authentication failed. Please check your email and password.')
    } finally {
      setIsAuthSubmitting(false)
    }
  }

  // This handler closes the Firebase session and returns to the auth screen.
  async function handleSignOut() {
    if (!auth) {
      return
    }

    await signOut(auth)
  }

  return {
    authError,
    authForm,
    authMode,
    handleAuthFormChange,
    handleAuthSubmit,
    handleSignOut,
    isAuthLoading,
    isAuthSubmitting,
    setAuthMode,
    user,
  }
}
