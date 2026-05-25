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

  return <Home />
}

export default App
