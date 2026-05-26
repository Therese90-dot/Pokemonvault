import { useEffect, useState } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { getTradeCardCount } from '../../services/tradeService'
import { supabase } from '../../services/supabase'

export function Navbar() {
  const { user, isLoadingAuth } = useAuth()
  const [tradeCount, setTradeCount] = useState(0)

  useEffect(() => {
    async function loadTradeCount(userId: string) {
      setTradeCount(await getTradeCardCount(userId))
    }

    if (user) {
      loadTradeCount(user.id)
    } else {
      window.setTimeout(() => setTradeCount(0), 0)
    }
  }, [user])

  async function handleLogout() {
    await supabase.auth.signOut()
    window.location.href = '/'
  }

  return (
    <header className="navbar">
      <a className="navbar__logo" href="/">
        Pokecard Vault
      </a>

      <nav className="navbar__links" aria-label="Main navigation">
        <a href="/">Home</a>
        <a href="/collection">My Collection</a>
        <a href="/wishlist">Wishlist</a>
        <a href="/trade">Trade ({tradeCount})</a>
      </nav>

      <div className="navbar__auth">
        {!isLoadingAuth && user && (
          <span className="navbar__email">{user.email}</span>
        )}

        {!isLoadingAuth && user ? (
          <button type="button" onClick={handleLogout}>
            Logout
          </button>
        ) : (
          <a href="/login">Login</a>
        )}
      </div>
    </header>
  )
}
