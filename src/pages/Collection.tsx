import { useEffect, useMemo, useState } from 'react'
import { CardGrid } from '../components/cards/CardGrid'
import { Navbar } from '../components/layout/Navbar'
import { useAuth } from '../hooks/useAuth'
import {
  addCardToCollection,
  decreaseCardQuantity,
  getCollectionCards,
  removeCardFromCollection,
} from '../services/collectionService'
import type { Card } from '../types/card'

type SortOption = 'price-low' | 'price-high' | 'name-az' | 'name-za'

export function Collection() {
  const { user, isLoadingAuth } = useAuth()
  const [cards, setCards] = useState<Card[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [sortOption, setSortOption] = useState<SortOption>('name-az')
  const [minPrice, setMinPrice] = useState('')
  const [maxPrice, setMaxPrice] = useState('')
  const [isLoadingCards, setIsLoadingCards] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    async function loadCollection(userId: string) {
      try {
        setIsLoadingCards(true)
        setErrorMessage('')
        setCards(await getCollectionCards(userId))
      } catch {
        setErrorMessage('Could not load your collection.')
      } finally {
        setIsLoadingCards(false)
      }
    }

    if (user) {
      loadCollection(user.id)
    } else {
      window.setTimeout(() => setCards([]), 0)
    }
  }, [user])

  const visibleCards = useMemo(() => {
    const cleanSearch = searchTerm.trim().toLowerCase()
    const min = minPrice === '' ? null : Number(minPrice)
    const max = maxPrice === '' ? null : Number(maxPrice)

    const filteredCards = cards.filter((card) => {
      const hasPriceFilter = min !== null || max !== null
      const cardPrice = card.price
      const matchesMin = min === null || (cardPrice !== null && cardPrice >= min)
      const matchesMax = max === null || (cardPrice !== null && cardPrice <= max)

      return (
        (cleanSearch === '' ||
          card.name.toLowerCase().includes(cleanSearch) ||
          card.set.toLowerCase().includes(cleanSearch)) &&
        (!hasPriceFilter || (matchesMin && matchesMax))
      )
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
  }, [cards, maxPrice, minPrice, searchTerm, sortOption])

  async function handleRemoveCard(cardId: string) {
    if (!user) {
      return
    }

    const updatedCards = await removeCardFromCollection(user.id, cardId)
    setCards(updatedCards)
  }

  async function handleIncreaseQuantity(card: Card) {
    if (!user) {
      return
    }

    const updatedCards = await addCardToCollection(user.id, card)
    setCards(updatedCards)
  }

  async function handleDecreaseQuantity(cardId: string) {
    if (!user) {
      return
    }

    const updatedCards = await decreaseCardQuantity(user.id, cardId)
    setCards(updatedCards)
  }

  return (
    <>
      <Navbar />

      <main className="home">
        <section className="home__section-heading collection-heading">
          <p>My Collection</p>
          <h1>Your saved Pokemon cards</h1>
        </section>

        <section className="filters collection-filters" aria-label="Collection filters">
          <label className="filter-control">
            <span>Search your cards</span>
            <input
              type="search"
              placeholder="Search by card or set name..."
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

          <label className="filter-control">
            <span>Min price</span>
            <input
              type="number"
              min="0"
              placeholder="0"
              value={minPrice}
              onChange={(event) => setMinPrice(event.target.value)}
            />
          </label>

          <label className="filter-control">
            <span>Max price</span>
            <input
              type="number"
              min="0"
              placeholder="500"
              value={maxPrice}
              onChange={(event) => setMaxPrice(event.target.value)}
            />
          </label>
        </section>

        {!isLoadingAuth && !user && (
          <p className="page-message">Login to save your collection</p>
        )}

        {isLoadingCards && <p className="page-message">Loading your collection...</p>}

        {errorMessage && <p className="page-message">{errorMessage}</p>}

        {!isLoadingCards && user && cards.length === 0 && (
          <p className="page-message">
            Your collection is empty. Add cards from the home page first.
          </p>
        )}

        {!isLoadingCards && cards.length > 0 && visibleCards.length === 0 && (
          <p className="page-message">No saved cards match your search.</p>
        )}

        {visibleCards.length > 0 && (
          <CardGrid
            cards={visibleCards}
            onAddToCollection={handleIncreaseQuantity}
            onRemoveFromCollection={handleRemoveCard}
            onDecreaseCollectionQuantity={handleDecreaseQuantity}
          />
        )}
      </main>
    </>
  )
}
