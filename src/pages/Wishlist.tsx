import { useEffect, useMemo, useState } from 'react'
import { CardGrid } from '../components/cards/CardGrid'
import { Navbar } from '../components/layout/Navbar'
import { useAuth } from '../hooks/useAuth'
import {
  getWishlistCards,
  removeCardFromWishlist,
} from '../services/wishlistService'
import type { Card } from '../types/card'

export function Wishlist() {
  const { user, isLoadingAuth } = useAuth()
  const [cards, setCards] = useState<Card[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [isLoadingCards, setIsLoadingCards] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    async function loadWishlist(userId: string) {
      try {
        setIsLoadingCards(true)
        setErrorMessage('')
        setCards(await getWishlistCards(userId))
      } catch {
        setErrorMessage('Could not load your wishlist.')
      } finally {
        setIsLoadingCards(false)
      }
    }

    if (user) {
      loadWishlist(user.id)
    } else {
      window.setTimeout(() => setCards([]), 0)
    }
  }, [user])

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

  async function handleRemoveCard(cardId: string) {
    if (!user) {
      return
    }

    const updatedCards = await removeCardFromWishlist(user.id, cardId)
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

        {!isLoadingAuth && !user && (
          <p className="page-message">Login to save your collection</p>
        )}

        {isLoadingCards && <p className="page-message">Loading your wishlist...</p>}

        {errorMessage && <p className="page-message">{errorMessage}</p>}

        {!isLoadingCards && user && cards.length === 0 && (
          <p className="page-message">
            Your wishlist is empty. Add cards from the home page first.
          </p>
        )}

        {!isLoadingCards && cards.length > 0 && visibleCards.length === 0 && (
          <p className="page-message">No wishlist cards match your search.</p>
        )}

        {visibleCards.length > 0 && (
          <CardGrid cards={visibleCards} onRemoveFromWishlist={handleRemoveCard} />
        )}
      </main>
    </>
  )
}
