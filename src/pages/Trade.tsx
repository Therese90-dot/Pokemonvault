import { useEffect, useMemo, useState } from 'react'
import { CardGrid } from '../components/cards/CardGrid'
import { Navbar } from '../components/layout/Navbar'
import { useAuth } from '../hooks/useAuth'
import { getCollectionCards } from '../services/collectionService'
import { getTradeCards, removeCardFromTrade } from '../services/tradeService'
import type { Card } from '../types/card'

type SortOption = 'price-low' | 'price-high' | 'name-az' | 'name-za'

export function Trade() {
  const { user, isLoadingAuth } = useAuth()
  const [cards, setCards] = useState<Card[]>([])
  const [collectionCards, setCollectionCards] = useState<Card[]>([])
  const collectionIds = useMemo(() => {
    return collectionCards.map((card) => card.id)
  }, [collectionCards])
  const collectionQuantities = useMemo(() => {
    return Object.fromEntries(
      collectionCards.map((card) => [card.id, card.quantity ?? 1]),
    )
  }, [collectionCards])
  const [searchTerm, setSearchTerm] = useState('')
  const [sortOption, setSortOption] = useState<SortOption>('name-az')
  const [isLoadingCards, setIsLoadingCards] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    async function loadTradeCards(userId: string) {
      try {
        setIsLoadingCards(true)
        setErrorMessage('')

        const [tradeCards, collectionCards] = await Promise.all([
          getTradeCards(userId),
          getCollectionCards(userId),
        ])

        setCards(tradeCards)
        setCollectionCards(collectionCards)
      } catch {
        setErrorMessage('Could not load your trade cards.')
      } finally {
        setIsLoadingCards(false)
      }
    }

    if (user) {
      loadTradeCards(user.id)
    } else {
      window.setTimeout(() => {
        setCards([])
        setCollectionCards([])
      }, 0)
    }
  }, [user])

  const visibleCards = useMemo(() => {
    const cleanSearch = searchTerm.trim().toLowerCase()

    const filteredCards = cards.filter((card) => {
      return cleanSearch === '' || card.name.toLowerCase().includes(cleanSearch)
    })

    return [...filteredCards].sort((firstCard, secondCard) => {
      if (sortOption === 'name-az') {
        return firstCard.name.localeCompare(secondCard.name)
      }

      if (sortOption === 'name-za') {
        return secondCard.name.localeCompare(firstCard.name)
      }

      if (firstCard.price === null && secondCard.price === null) {
        return 0
      }

      if (firstCard.price === null) {
        return 1
      }

      if (secondCard.price === null) {
        return -1
      }

      if (sortOption === 'price-high') {
        return secondCard.price - firstCard.price
      }

      return firstCard.price - secondCard.price
    })
  }, [cards, searchTerm, sortOption])

  async function handleRemoveCard(cardId: string) {
    if (!user) {
      return
    }

    const updatedCards = await removeCardFromTrade(user.id, cardId)
    setCards(updatedCards)
  }

  return (
    <>
      <Navbar />

      <main className="home">
        <section className="home__section-heading collection-heading">
          <p>Trade Binder</p>
          <h1>Cards ready to trade</h1>
        </section>

        {!isLoadingAuth && !user && (
          <p className="page-message">Login to save your collection</p>
        )}

        {isLoadingCards && <p className="page-message">Loading your trade cards...</p>}

        {errorMessage && <p className="page-message">{errorMessage}</p>}

        {!isLoadingCards && user && cards.length === 0 && (
          <section className="empty-state">
            <p>Your trade binder is empty</p>
            <a href="/">Browse cards</a>
          </section>
        )}

        {!isLoadingCards && cards.length > 0 && (
          <>
            <section className="filters collection-filters" aria-label="Trade filters">
              <label className="filter-control">
                <span>Card name</span>
                <input
                  type="search"
                  placeholder="Search your trade cards..."
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                />
              </label>

              <label className="filter-control">
                <span>Sort by</span>
                <select
                  value={sortOption}
                  onChange={(event) =>
                    setSortOption(event.target.value as SortOption)
                  }
                >
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="name-az">Name: A-Z</option>
                  <option value="name-za">Name: Z-A</option>
                </select>
              </label>
            </section>

            {visibleCards.length === 0 && (
              <p className="page-message">No trade cards match your search.</p>
            )}

            {visibleCards.length > 0 && (
              <CardGrid
                cards={visibleCards}
                collectionIds={collectionIds}
                collectionQuantities={collectionQuantities}
                onRemoveFromTrade={handleRemoveCard}
              />
            )}
          </>
        )}
      </main>
    </>
  )
}
