import { useMemo, useState } from 'react'
import { CardGrid } from '../components/cards/CardGrid'
import { Navbar } from '../components/layout/Navbar'
import {
  getWishlistCards,
  removeCardFromWishlist,
} from '../services/wishlistStorage'

export function Wishlist() {
  const [cards, setCards] = useState(() => getWishlistCards())
  const [searchTerm, setSearchTerm] = useState('')

  const visibleCards = useMemo(() => {
    const cleanSearch = searchTerm.trim().toLowerCase()

    return cards.filter((card) => {
      return (
        cleanSearch === '' ||
        card.name.toLowerCase().includes(cleanSearch) ||
        card.set.toLowerCase().includes(cleanSearch)
      )
    })
  }, [cards, searchTerm])

  function handleRemoveCard(cardId: string) {
    const updatedCards = removeCardFromWishlist(cardId)
    setCards(updatedCards)
  }

  return (
    <>
      <Navbar />

      <main className="home">
        <section className="home__section-heading collection-heading">
          <p>Wishlist</p>
          <h1>Cards you want next</h1>
        </section>

        <label className="filter-control collection-search">
          <span>Search wishlist</span>
          <input
            type="search"
            placeholder="Search by card or set name..."
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
          />
        </label>

        {cards.length === 0 && (
          <p className="page-message">
            Your wishlist is empty. Add cards from the home page first.
          </p>
        )}

        {cards.length > 0 && visibleCards.length === 0 && (
          <p className="page-message">No wishlist cards match your search.</p>
        )}

        {visibleCards.length > 0 && (
          <CardGrid cards={visibleCards} onRemoveFromWishlist={handleRemoveCard} />
        )}
      </main>
    </>
  )
}
