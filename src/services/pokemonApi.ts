import type { Card, CardSeries } from '../types/card'

type PokemonSet = {
  id: string
  name: string
  series: string
  releaseDate?: string
}

type PokemonCard = {
  id: string
  name: string
  number: string
  rarity?: string
  set: PokemonSet
  types?: string[]
  images: {
    small: string
    large?: string
  }
  tcgplayer?: {
    prices?: {
      normal?: { market?: number }
      holofoil?: { market?: number }
      reverseHolofoil?: { market?: number }
    }
  }
}

type SetsResponse = {
  data: PokemonSet[]
}

type CardsResponse = {
  data: PokemonCard[]
  totalCount: number
}

type CardResponse = {
  data: PokemonCard
}

const apiBaseUrl = 'https://api.pokemontcg.io/v2'
const cacheTime = 24 * 60 * 60 * 1000
const featuredMegaEvolutionNumbers = ['187', '179', '188', '178']
const megaEvolutionSetNames = [
  'Phantasmal Flames',
  'Ascended Heroes',
  'Perfect Order',
  'Chaos Rising',
]

export type PokemonSetOption = {
  id: string
  name: string
  series: CardSeries
  releaseDate?: string
}

type CachedData<T> = {
  savedAt: number
  data: T
}

function getCachedData<T>(cacheKey: string) {
  const cachedText = localStorage.getItem(cacheKey)

  if (!cachedText) {
    return null
  }

  try {
    const cachedData: CachedData<T> = JSON.parse(cachedText)
    const cacheIsFresh = Date.now() - cachedData.savedAt < cacheTime

    return cacheIsFresh ? cachedData.data : null
  } catch {
    localStorage.removeItem(cacheKey)
    return null
  }
}

function saveCachedData<T>(cacheKey: string, data: T) {
  const cachedData: CachedData<T> = {
    savedAt: Date.now(),
    data,
  }

  try {
    localStorage.setItem(cacheKey, JSON.stringify(cachedData))
  } catch {
    return
  }
}

function isMegaEvolutionSet(set: PokemonSet) {
  return (
    set.name === 'Mega Evolution' ||
    set.name.includes('Mega Evolution') ||
    megaEvolutionSetNames.includes(set.name)
  )
}

function getAppSeries(set: PokemonSet): CardSeries {
  if (isMegaEvolutionSet(set)) {
    return 'Mega Evolution'
  }

  return 'Scarlet & Violet'
}

function isWantedSet(set: PokemonSet) {
  return (
    set.series === 'Scarlet & Violet' ||
    isMegaEvolutionSet(set)
  )
}

function sortSetsByReleaseDate(firstSet: PokemonSet, secondSet: PokemonSet) {
  const firstDate = firstSet.releaseDate ?? ''
  const secondDate = secondSet.releaseDate ?? ''

  if (firstDate !== secondDate) {
    return firstDate.localeCompare(secondDate)
  }

  return firstSet.name.localeCompare(secondSet.name)
}

function convertSet(set: PokemonSet): PokemonSetOption {
  return {
    id: set.id,
    name: set.name,
    series: getAppSeries(set),
    releaseDate: set.releaseDate,
  }
}

function getMarketPrice(card: PokemonCard) {
  const prices = card.tcgplayer?.prices

  return (
    prices?.holofoil?.market ??
    prices?.normal?.market ??
    prices?.reverseHolofoil?.market ??
    null
  )
}

function convertPokemonCard(card: PokemonCard, set: PokemonSetOption): Card {
  const price = getMarketPrice(card)

  return {
    id: card.id,
    name: card.name,
    setId: set.id,
    set: set.name,
    series: set.series,
    number: card.number,
    type: card.types?.[0] ?? 'Unknown',
    rarity: card.rarity ?? 'Unknown rarity',
    imageUrl: card.images.large ?? card.images.small,
    price,
    inCollection: false,
    forTrade: false,
    forSale: price !== null,
  }
}

function convertPokemonCardBySet(card: PokemonCard): Card {
  return convertPokemonCard(card, convertSet(card.set))
}

export async function fetchWantedSets() {
  const cacheKey = 'pokemon-sets-v2'
  const cachedSets = getCachedData<PokemonSetOption[]>(cacheKey)

  if (cachedSets) {
    return cachedSets
  }

  const response = await fetch(`${apiBaseUrl}/sets`)

  if (!response.ok) {
    throw new Error('Could not load Pokemon sets.')
  }

  const result: SetsResponse = await response.json()

  const sets = result.data.filter(isWantedSet).sort(sortSetsByReleaseDate).map(convertSet)

  saveCachedData(cacheKey, sets)

  return sets
}

export async function fetchFeaturedMegaEvolutionCards() {
  const sets = await fetchWantedSets()
  const megaEvolutionSet = sets.find((set) => set.name === 'Mega Evolution')

  if (!megaEvolutionSet) {
    return []
  }

  const cards = await fetchCardsBySet(megaEvolutionSet)

  return featuredMegaEvolutionNumbers
    .map((number) => cards.find((card) => card.number === number))
    .filter((card): card is Card => card !== undefined)
}

export async function fetchCardsBySet(set: PokemonSetOption) {
  const cacheKey = `pokemon-cards-${set.id}`
  const cachedCards = getCachedData<Card[]>(cacheKey)

  if (cachedCards) {
    return cachedCards
  }

  const query = encodeURIComponent(`set.id:${set.id}`)
  const pageSize = 250
  let page = 1
  let totalCount = 0
  const cards: PokemonCard[] = []

  do {
    const response = await fetch(
      `${apiBaseUrl}/cards?q=${query}&pageSize=${pageSize}&page=${page}`,
    )

    if (!response.ok) {
      throw new Error(`Could not load cards for set ${set.name}.`)
    }

    const result: CardsResponse = await response.json()

    cards.push(...result.data)
    totalCount = result.totalCount
    page = page + 1
  } while (cards.length < totalCount)

  const convertedCards = cards.map((card) => convertPokemonCard(card, set))

  saveCachedData(cacheKey, convertedCards)

  return convertedCards
}

export async function fetchCardById(cardId: string) {
  const cacheKey = `pokemon-card-${cardId}`
  const cachedCard = getCachedData<Card>(cacheKey)

  if (cachedCard) {
    return cachedCard
  }

  const response = await fetch(`${apiBaseUrl}/cards/${cardId}`)

  if (!response.ok) {
    throw new Error(`Could not load card ${cardId}.`)
  }

  const result: CardResponse = await response.json()
  const card = convertPokemonCardBySet(result.data)

  saveCachedData(cacheKey, card)

  return card
}

export async function fetchCardsByIds(cardIds: string[]) {
  const uniqueCardIds = [...new Set(cardIds)]

  if (uniqueCardIds.length === 0) {
    return []
  }

  return Promise.all(uniqueCardIds.map((cardId) => fetchCardById(cardId)))
}
