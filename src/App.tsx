import { Collection } from './pages/Collection'
import { Home } from './pages/Home'
import { Wishlist } from './pages/Wishlist'

function App() {
  const path = window.location.pathname

  if (path === '/collection') {
    return <Collection />
  }

  if (path === '/wishlist') {
    return <Wishlist />
  }

  return <Home />
}

export default App
