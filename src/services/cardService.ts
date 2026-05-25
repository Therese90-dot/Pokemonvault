import type { Card } from '../types/card'

type PokemonTcgCard = {
  id: string
  name: string
  number: string
  rarity?: string
  set: {
    id: string
    name: string
  }
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

type PokemonTcgResponse = {
  data: PokemonTcgCard[]
}

const baseUrl = 'https://api.pokemontcg.io/v2/cards'

function getCardPrice(apiCard: PokemonTcgCard) {
  const prices = apiCard.tcgplayer?.prices

  return (
    prices?.holofoil?.market ??
    prices?.normal?.market ??
    prices?.reverseHolofoil?.market ??
    0
  )
}

function makeCardQuery(searchTerm: string) {
  const queryParts = ['set.name:"Mega Evolution"']
  const trimmedSearch = searchTerm.trim().replaceAll('"', '')

  if (trimmedSearch) {
    const nameQuery = trimmedSearch.includes(' ')
      ? `name:"${trimmedSearch}"`
      : `name:${trimmedSearch}*`

    queryParts.push(nameQuery)
  }

  return queryParts.join(' ')
}

function convertApiCard(apiCard: PokemonTcgCard): Card {
  const price = getCardPrice(apiCard)

  return {
    id: apiCard.id,
    name: apiCard.name,
    setId: apiCard.set.id,
    set: apiCard.set.name,
    series: 'Mega Evolution',
    number: apiCard.number,
    type: apiCard.types?.[0] ?? 'Unknown',
    rarity: apiCard.rarity ?? 'Unknown rarity',
    imageUrl: apiCard.images.large ?? apiCard.images.small,
    price,
    inCollection: false,
    forTrade: false,
    forSale: price > 0,
  }
}

export async function fetchMegaEvolutionCards(searchTerm = '') {
  const query = makeCardQuery(searchTerm)
  const url = `${baseUrl}?q=${encodeURIComponent(query)}`

  const response = await fetch(url)

  if (!response.ok) {
    throw new Error('Could not load Pokemon cards.')
  }

  const result: PokemonTcgResponse = await response.json()

  return result.data.map(convertApiCard)
}
