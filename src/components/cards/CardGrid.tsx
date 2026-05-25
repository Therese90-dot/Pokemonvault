import type { Card } from '../../types/card'
import { CardItem } from './CardItem'

type CardGridProps = {
  cards: Card[]
  collectionIds?: string[]
  wishlistIds?: string[]
  onAddToCollection?: (card: Card) => void
  onRemoveFromCollection?: (cardId: string) => void
  onAddToWishlist?: (card: Card) => void
  onRemoveFromWishlist?: (cardId: string) => void
}

export function CardGrid({
  cards,
  collectionIds = [],
  wishlistIds = [],
  onAddToCollection,
  onRemoveFromCollection,
  onAddToWishlist,
  onRemoveFromWishlist,
}: CardGridProps) {
  return (
    <section className="card-grid" aria-label="Pokemon cards">
      {cards.map((card) => (
        <CardItem
          key={card.id}
          card={card}
          collectionIds={collectionIds}
          wishlistIds={wishlistIds}
          onAddToCollection={onAddToCollection}
          onRemoveFromCollection={onRemoveFromCollection}
          onAddToWishlist={onAddToWishlist}
          onRemoveFromWishlist={onRemoveFromWishlist}
        />
      ))}
    </section>
  )
}
