import type { Card } from '../types/card'

const collectionKey = 'my-pokemon-card-collection'

export function getCollectionCards() {
  const savedText = localStorage.getItem(collectionKey)

  if (!savedText) {
    return []
  }

  try {
    return JSON.parse(savedText) as Card[]
  } catch {
    localStorage.removeItem(collectionKey)
    return []
  }
}

function saveCollectionCards(cards: Card[]) {
  localStorage.setItem(collectionKey, JSON.stringify(cards))
}

export function addCardToCollection(card: Card) {
  const cards = getCollectionCards()
  const cardAlreadySaved = cards.some((savedCard) => savedCard.id === card.id)

  if (cardAlreadySaved) {
    return cards
  }

  const updatedCards = [{ ...card, inCollection: true }, ...cards]
  saveCollectionCards(updatedCards)

  return updatedCards
}

export function removeCardFromCollection(cardId: string) {
  const cards = getCollectionCards()
  const updatedCards = cards.filter((card) => card.id !== cardId)

  saveCollectionCards(updatedCards)

  return updatedCards
}
