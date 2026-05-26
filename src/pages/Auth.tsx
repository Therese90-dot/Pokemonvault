import { useState } from 'react'
import { Navbar } from '../components/layout/Navbar'
import { useAuth } from '../hooks/useAuth'
import { supabase } from '../services/supabase'

type AuthMode = 'login' | 'signup'

export function Auth() {
  const { user, isLoadingAuth } = useAuth()
  const [mode, setMode] = useState<AuthMode>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setMessage('')
    setErrorMessage('')
    setIsSubmitting(true)

    const cleanEmail = email.trim()

    const authResponse =
      mode === 'login'
        ? await supabase.auth.signInWithPassword({
            email: cleanEmail,
            password,
          })
        : await supabase.auth.signUp({
            email: cleanEmail,
            password,
          })

    setIsSubmitting(false)

    if (authResponse.error) {
      setErrorMessage(authResponse.error.message)
      return
    }

    if (mode === 'signup') {
      setMessage('Signup successful. Check your email if Supabase asks you to confirm your account.')
      return
    }

    window.location.href = '/'
  }

  async function handleLogout() {
    await supabase.auth.signOut()
    setMessage('You are logged out.')
  }

  return (
    <>
      <Navbar />

      <main className="auth-page">
        <section className="auth-panel" aria-labelledby="auth-title">
          <div className="auth-panel__header">
            <p>{mode === 'login' ? 'Welcome back' : 'Create account'}</p>
            <h1 id="auth-title">
              {mode === 'login' ? 'Log in to PokemonVault' : 'Sign up for PokemonVault'}
            </h1>
          </div>

          {!isLoadingAuth && user && (
            <div className="auth-status">
              <p>Logged in as {user.email}</p>
              <button type="button" onClick={handleLogout}>
                Logout
              </button>
            </div>
          )}

          <form className="auth-form" onSubmit={handleSubmit}>
            <label className="filter-control">
              <span>Email</span>
              <input
                type="email"
                autoComplete="email"
                placeholder="trainer@example.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
              />
            </label>

            <label className="filter-control">
              <span>Password</span>
              <input
                type="password"
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                minLength={6}
                placeholder="At least 6 characters"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
              />
            </label>

            {errorMessage && <p className="auth-message auth-message--error">{errorMessage}</p>}
            {message && <p className="auth-message">{message}</p>}

            <button className="auth-submit" type="submit" disabled={isSubmitting}>
              {isSubmitting
                ? 'Working...'
                : mode === 'login'
                  ? 'Login'
                  : 'Sign up'}
            </button>
          </form>

          <button
            className="auth-switch"
            type="button"
            onClick={() => {
              setMode((currentMode) =>
                currentMode === 'login' ? 'signup' : 'login',
              )
              setMessage('')
              setErrorMessage('')
            }}
          >
            {mode === 'login'
              ? 'Need an account? Sign up'
              : 'Already have an account? Login'}
          </button>
        </section>
      </main>
    </>
  )
}
