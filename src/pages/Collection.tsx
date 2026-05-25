import { useMemo, useState } from 'react'
import { CardGrid } from '../components/cards/CardGrid'
import { Navbar } from '../components/layout/Navbar'
import {
  getCollectionCards,
  removeCardFromCollection,
} from '../services/collectionStorage'

type SortOption = 'price-low' | 'price-high' | 'name-az' | 'name-za'

export function Collection() {
  const [cards, setCards] = useState(() => getCollectionCards())
  const [searchTerm, setSearchTerm] = useState('')
  const [sortOption, setSortOption] = useState<SortOption>('name-az')
  const [minPrice, setMinPrice] = useState('')
  const [maxPrice, setMaxPrice] = useState('')

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

  function handleRemoveCard(cardId: string) {
    const updatedCards = removeCardFromCollection(cardId)
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

        {cards.length === 0 && (
          <p className="page-message">
            Your collection is empty. Add cards from the home page first.
          </p>
        )}

        {cards.length > 0 && visibleCards.length === 0 && (
          <p className="page-message">No saved cards match your search.</p>
        )}

        {visibleCards.length > 0 && (
          <CardGrid
            cards={visibleCards}
            onRemoveFromCollection={handleRemoveCard}
          />
        )}
      </main>
    </>
  )
}
