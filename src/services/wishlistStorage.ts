import type { Card } from '../types/card'

const wishlistKey = 'my-pokemon-card-wishlist'

export function getWishlistCards() {
  const savedText = localStorage.getItem(wishlistKey)

  if (!savedText) {
    return []
  }

  try {
    return JSON.parse(savedText) as Card[]
  } catch {
    localStorage.removeItem(wishlistKey)
    return []
  }
}

function saveWishlistCards(cards: Card[]) {
  localStorage.setItem(wishlistKey, JSON.stringify(cards))
}

export function addCardToWishlist(card: Card) {
  const cards = getWishlistCards()
  const cardAlreadySaved = cards.some((savedCard) => savedCard.id === card.id)

  if (cardAlreadySaved) {
    return cards
  }

  const updatedCards = [card, ...cards]
  saveWishlistCards(updatedCards)

  return updatedCards
}

export function removeCardFromWishlist(cardId: string) {
  const cards = getWishlistCards()
  const updatedCards = cards.filter((card) => card.id !== cardId)

  saveWishlistCards(updatedCards)

  return updatedCards
}
