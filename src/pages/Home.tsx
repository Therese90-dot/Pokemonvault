import { useEffect, useMemo, useState } from 'react'
import { CardGrid } from '../components/cards/CardGrid'
import { Navbar } from '../components/layout/Navbar'
import { useAuth } from '../hooks/useAuth'
import {
  addCardToCollection,
  getCollectionCards,
  removeCardFromCollection,
} from '../services/collectionService'
import {
  addCardToTrade,
  getTradeCards,
  removeCardFromTrade,
} from '../services/tradeService'
import {
  addCardToWishlist,
  getWishlistCards,
  removeCardFromWishlist,
} from '../services/wishlistService'
import {
  fetchCardsBySet,
  fetchFeaturedMegaEvolutionCards,
  fetchWantedSets,
  type PokemonSetOption,
} from '../services/pokemonApi'
import type { Card, CardSeries } from '../types/card'

type SeriesFilter = CardSeries | 'All'
type SortOption = 'price-low' | 'price-high' | 'name-az' | 'name-za'

function LoadingSkeleton() {
  return (
    <section className="card-grid" aria-label="Loading cards">
      {[1, 2, 3, 4].map((item) => (
        <article className="card-skeleton" key={item}>
          <div className="card-skeleton__image"></div>
          <div className="card-skeleton__line card-skeleton__line--short"></div>
          <div className="card-skeleton__line"></div>
          <div className="card-skeleton__line"></div>
        </article>
      ))}
    </section>
  )
}

export function Home() {
  const { user, isLoadingAuth } = useAuth()
  const [sets, setSets] = useState<PokemonSetOption[]>([])
  const [cards, setCards] = useState<Card[]>([])
  const [featuredHits, setFeaturedHits] = useState<Card[]>([])
  const [collectionCards, setCollectionCards] = useState<Card[]>([])
  const [wishlistIds, setWishlistIds] = useState<string[]>([])
  const [tradeIds, setTradeIds] = useState<string[]>([])
  const [seriesFilter, setSeriesFilter] = useState<SeriesFilter>('All')
  const [selectedSetId, setSelectedSetId] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [sortOption, setSortOption] = useState<SortOption>('name-az')
  const [minPrice, setMinPrice] = useState('')
  const [maxPrice, setMaxPrice] = useState('')
  const [isLoadingFeaturedHits, setIsLoadingFeaturedHits] = useState(true)
  const [isLoadingSets, setIsLoadingSets] = useState(true)
  const [isLoadingCards, setIsLoadingCards] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [saveMessage, setSaveMessage] = useState('')

  useEffect(() => {
    async function loadSavedCards(userId: string) {
      try {
        const [collectionCards, wishlistCards, tradeCards] = await Promise.all([
          getCollectionCards(userId),
          getWishlistCards(userId),
          getTradeCards(userId),
        ])

        setCollectionCards(collectionCards)
        setWishlistIds(wishlistCards.map((card) => card.id))
        setTradeIds(tradeCards.map((card) => card.id))
      } catch {
        setSaveMessage('Could not load your saved cards.')
      }
    }

    if (user) {
      loadSavedCards(user.id)
    } else {
      window.setTimeout(() => {
        setCollectionCards([])
        setWishlistIds([])
        setTradeIds([])
      }, 0)
    }
  }, [user])

  useEffect(() => {
    async function loadFeaturedHits() {
      try {
        setIsLoadingFeaturedHits(true)

        const cards = await fetchFeaturedMegaEvolutionCards()
        setFeaturedHits(cards)
      } finally {
        setIsLoadingFeaturedHits(false)
      }
    }

    loadFeaturedHits()
  }, [])

  useEffect(() => {
    async function loadSets() {
      try {
        setIsLoadingSets(true)
        setErrorMessage('')

        const apiSets = await fetchWantedSets()
        setSets(apiSets)
        setSelectedSetId(apiSets[0]?.id ?? '')
      } catch {
        setErrorMessage('Something went wrong while loading sets.')
        setSets([])
      } finally {
        setIsLoadingSets(false)
      }
    }

    loadSets()
  }, [])

  const availableSets = useMemo(() => {
    return sets.filter(
      (set) => seriesFilter === 'All' || set.series === seriesFilter,
    )
  }, [seriesFilter, sets])

  useEffect(() => {
    const selectedSetIsVisible = availableSets.some(
      (set) => set.id === selectedSetId,
    )

    if (!selectedSetIsVisible) {
      setSelectedSetId(availableSets[0]?.id ?? '')
    }
  }, [availableSets, selectedSetId])

  const selectedSet = useMemo(() => {
    return sets.find((set) => set.id === selectedSetId)
  }, [selectedSetId, sets])

  useEffect(() => {
    async function loadCardsForSet(set: PokemonSetOption) {
      try {
        setIsLoadingCards(true)
        setErrorMessage('')

        const apiCards = await fetchCardsBySet(set)
        setCards(apiCards)
      } catch {
        setErrorMessage('Something went wrong while loading cards.')
        setCards([])
      } finally {
        setIsLoadingCards(false)
      }
    }

    if (selectedSet) {
      loadCardsForSet(selectedSet)
    } else {
      setCards([])
    }
  }, [selectedSet])

  const visibleCards = useMemo(() => {
    const cleanSearch = searchTerm.trim().toLowerCase()
    const min = minPrice === '' ? null : Number(minPrice)
    const max = maxPrice === '' ? null : Number(maxPrice)

    const filteredCards = cards.filter((card) => {
      const matchesName =
        cleanSearch === '' || card.name.toLowerCase().includes(cleanSearch)
      const hasPriceFilter = min !== null || max !== null
      const cardPrice = card.price
      const matchesMin = min === null || (cardPrice !== null && cardPrice >= min)
      const matchesMax = max === null || (cardPrice !== null && cardPrice <= max)

      return matchesName && (!hasPriceFilter || (matchesMin && matchesMax))
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

  const collectionValue = collectionCards.reduce(
    (total, card) => total + (card.price ?? 0) * (card.quantity ?? 1),
    0,
  )
  const collectionCount = collectionCards.reduce(
    (total, card) => total + (card.quantity ?? 1),
    0,
  )
  const collectionIds = useMemo(() => {
    return collectionCards.map((card) => card.id)
  }, [collectionCards])
  const collectionQuantities = useMemo(() => {
    return Object.fromEntries(
      collectionCards.map((card) => [card.id, card.quantity ?? 1]),
    )
  }, [collectionCards])
  const isLoading = isLoadingSets || isLoadingCards

  function showLoginMessage() {
    setSaveMessage('Login to save your collection')
  }

  async function handleAddToCollection(card: Card) {
    if (!user) {
      showLoginMessage()
      return
    }

    const updatedCards = await addCardToCollection(user.id, card)
    setCollectionCards(updatedCards)
  }

  async function handleRemoveFromCollection(cardId: string) {
    if (!user) {
      showLoginMessage()
      return
    }

    const updatedCards = await removeCardFromCollection(user.id, cardId)
    setCollectionCards(updatedCards)
  }

  async function handleAddToWishlist(card: Card) {
    if (!user) {
      showLoginMessage()
      return
    }

    const updatedCards = await addCardToWishlist(user.id, card.id)
    setWishlistIds(updatedCards.map((savedCard) => savedCard.id))
  }

  async function handleRemoveFromWishlist(cardId: string) {
    if (!user) {
      showLoginMessage()
      return
    }

    const updatedCards = await removeCardFromWishlist(user.id, cardId)
    setWishlistIds(updatedCards.map((savedCard) => savedCard.id))
  }

  async function handleAddToTrade(card: Card) {
    if (!user) {
      showLoginMessage()
      return
    }

    const updatedCards = await addCardToTrade(user.id, card.id)
    setTradeIds(updatedCards.map((savedCard) => savedCard.id))
  }

  async function handleRemoveFromTrade(cardId: string) {
    if (!user) {
      showLoginMessage()
      return
    }

    const updatedCards = await removeCardFromTrade(user.id, cardId)
    setTradeIds(updatedCards.map((savedCard) => savedCard.id))
  }

  return (
    <>
      <Navbar />

      <main className="home">
        <section className="hero">
          <div className="hero__content">
            <p className="hero__eyebrow">Trainer collection dashboard</p>
            <h1>Build your ultimate Pokemon card vault.</h1>
            <p>
              Track favorites, spot cards for trade, and keep an eye on sale
              prices from one clean collection view.
            </p>
          </div>

          <div className="hero__panel" aria-label="Collection highlights">
            <span>{collectionCount} cards in my collection</span>
            <strong>${collectionValue.toFixed(2)}</strong>
            <p>My collection market value</p>
          </div>
        </section>

        <section className="home__section-heading">
          <p>Featured hits</p>
          <h2>Mega Evolution chase cards</h2>
        </section>

        {!isLoadingAuth && !user && (
          <p className="page-message">Login to save your collection</p>
        )}
        {saveMessage && <p className="page-message">{saveMessage}</p>}

        {isLoadingFeaturedHits && <LoadingSkeleton />}
        {!isLoadingFeaturedHits && featuredHits.length > 0 && (
          <CardGrid
            cards={featuredHits}
            collectionIds={collectionIds}
            collectionQuantities={collectionQuantities}
            wishlistIds={wishlistIds}
            tradeIds={tradeIds}
            onAddToCollection={handleAddToCollection}
            onRemoveFromCollection={handleRemoveFromCollection}
            onAddToWishlist={handleAddToWishlist}
            onRemoveFromWishlist={handleRemoveFromWishlist}
            onAddToTrade={handleAddToTrade}
            onRemoveFromTrade={handleRemoveFromTrade}
          />
        )}
        {!isLoadingFeaturedHits && featuredHits.length === 0 && (
          <p className="page-message">Featured Mega Evolution cards not found.</p>
        )}

        <section className="home__section-heading">
          <p>Pokemon TCG API</p>
          <h2>Full collection</h2>
        </section>

        <section className="filters" aria-label="Card filters">
          <label className="filter-control">
            <span>Series</span>
            <select
              value={seriesFilter}
              onChange={(event) => {
                setSeriesFilter(event.target.value as SeriesFilter)
              }}
            >
              <option value="All">All</option>
              <option value="Scarlet & Violet">Scarlet & Violet</option>
              <option value="Mega Evolution">Mega Evolution</option>
            </select>
          </label>

          <label className="filter-control">
            <span>Set name</span>
            <select
              value={selectedSetId}
              onChange={(event) => setSelectedSetId(event.target.value)}
              disabled={availableSets.length === 0}
            >
              {availableSets.map((set) => (
                <option key={set.id} value={set.id}>
                  {set.name}
                </option>
              ))}
            </select>
          </label>

          <label className="filter-control">
            <span>Card name</span>
            <input
              type="search"
              placeholder="Search Charizard, Mewtwo, Pikachu..."
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

        {isLoading && <LoadingSkeleton />}
        {errorMessage && <p className="page-message">{errorMessage}</p>}
        {!isLoading && !errorMessage && !selectedSet && (
          <p className="page-message">No sets found for this series.</p>
        )}
        {!isLoading && !errorMessage && selectedSet && visibleCards.length === 0 && (
          <p className="page-message">No cards found. Try another name.</p>
        )}

        {!isLoading && !errorMessage && selectedSet && (
          <CardGrid
            cards={visibleCards}
            collectionIds={collectionIds}
            collectionQuantities={collectionQuantities}
            wishlistIds={wishlistIds}
            tradeIds={tradeIds}
            onAddToCollection={handleAddToCollection}
            onRemoveFromCollection={handleRemoveFromCollection}
            onAddToWishlist={handleAddToWishlist}
            onRemoveFromWishlist={handleRemoveFromWishlist}
            onAddToTrade={handleAddToTrade}
            onRemoveFromTrade={handleRemoveFromTrade}
          />
        )}
      </main>
    </>
  )
}
