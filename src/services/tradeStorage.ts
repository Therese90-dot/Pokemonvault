import type { Card } from '../types/card'

const tradeKey = 'my-pokemon-card-trade-list'

export function getTradeCards() {
  const savedText = localStorage.getItem(tradeKey)

  if (!savedText) {
    return []
  }

  try {
    return JSON.parse(savedText) as Card[]
  } catch {
    localStorage.removeItem(tradeKey)
    return []
  }
}

function saveTradeCards(cards: Card[]) {
  localStorage.setItem(tradeKey, JSON.stringify(cards))
}

export function addCardToTrade(card: Card) {
  const cards = getTradeCards()
  const cardAlreadySaved = cards.some((savedCard) => savedCard.id === card.id)

  if (cardAlreadySaved) {
    return cards
  }

  const updatedCards = [{ ...card, forTrade: true }, ...cards]
  saveTradeCards(updatedCards)

  return updatedCards
}

export function removeCardFromTrade(cardId: string) {
  const cards = getTradeCards()
  const updatedCards = cards.filter((card) => card.id !== cardId)

  saveTradeCards(updatedCards)

  return updatedCards
}
