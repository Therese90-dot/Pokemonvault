export function Navbar() {
  return (
    <header className="navbar">
      <a className="navbar__logo" href="/">
        Pokecard Vault
      </a>

      <nav className="navbar__links" aria-label="Main navigation">
        <a href="/">Home</a>
        <a href="/collection">My Collection</a>
        <a href="/wishlist">Wishlist</a>
        <a href="/trade">Trade</a>
      </nav>
    </header>
  )
}
