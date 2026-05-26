import { Auth } from './pages/Auth'
import { Collection } from './pages/Collection'
import { Home } from './pages/Home'
import { Trade } from './pages/Trade'
import { Wishlist } from './pages/Wishlist'

function App() {
  const path = window.location.pathname

  if (path === '/collection') {
    return <Collection />
  }

  if (path === '/wishlist') {
    return <Wishlist />
  }

  if (path === '/trade') {
    return <Trade />
  }

  if (path === '/login' || path === '/signup') {
    return <Auth />
  }

  return <Home />
}

export default App
