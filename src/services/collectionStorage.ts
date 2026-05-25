import type { Card } from '../types/card'

const collectionKey = 'my-pokemon-card-collection'

function addQuantityToCard(card: Card): Card {
  return {
    ...card,
    inCollection: true,
    quantity: card.quantity ?? 1,
  }
}

export function getCollectionCards() {
  const savedText = localStorage.getItem(collectionKey)

  if (!savedText) {
    return []
  }

  try {
    const cards = JSON.parse(savedText) as Card[]

    return cards.map(addQuantityToCard)
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
  const updatedCards = cardAlreadySaved
    ? cards.map((savedCard) => {
        if (savedCard.id !== card.id) {
          return savedCard
        }

        return {
          ...savedCard,
          quantity: (savedCard.quantity ?? 1) + 1,
        }
      })
    : [{ ...card, inCollection: true, quantity: 1 }, ...cards]

  saveCollectionCards(updatedCards)

  return updatedCards
}

export function decreaseCardQuantity(cardId: string) {
  const cards = getCollectionCards()
  const updatedCards = cards
    .map((card) => {
      if (card.id !== cardId) {
        return card
      }

      return {
        ...card,
        quantity: (card.quantity ?? 1) - 1,
      }
    })
    .filter((card) => (card.quantity ?? 1) > 0)

  saveCollectionCards(updatedCards)

  return updatedCards
}

export function removeCardFromCollection(cardId: string) {
  const cards = getCollectionCards()
  const updatedCards = cards.filter((card) => card.id !== cardId)

  saveCollectionCards(updatedCards)

  return updatedCards
}
