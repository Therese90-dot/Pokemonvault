import type { Card } from '../../types/card'
import { CardItem } from './CardItem'

type CardGridProps = {
  cards: Card[]
  collectionIds?: string[]
  wishlistIds?: string[]
  tradeIds?: string[]
  onAddToCollection?: (card: Card) => void
  onRemoveFromCollection?: (cardId: string) => void
  onAddToWishlist?: (card: Card) => void
  onRemoveFromWishlist?: (cardId: string) => void
  onAddToTrade?: (card: Card) => void
  onRemoveFromTrade?: (cardId: string) => void
}

export function CardGrid({
  cards,
  collectionIds = [],
  wishlistIds = [],
  tradeIds = [],
  onAddToCollection,
  onRemoveFromCollection,
  onAddToWishlist,
  onRemoveFromWishlist,
  onAddToTrade,
  onRemoveFromTrade,
}: CardGridProps) {
  return (
    <section className="card-grid" aria-label="Pokemon cards">
      {cards.map((card) => (
        <CardItem
          key={card.id}
          card={card}
          collectionIds={collectionIds}
          wishlistIds={wishlistIds}
          tradeIds={tradeIds}
          onAddToCollection={onAddToCollection}
          onRemoveFromCollection={onRemoveFromCollection}
          onAddToWishlist={onAddToWishlist}
          onRemoveFromWishlist={onRemoveFromWishlist}
          onAddToTrade={onAddToTrade}
          onRemoveFromTrade={onRemoveFromTrade}
        />
      ))}
    </section>
  )
}
