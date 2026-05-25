import type { Card } from '../../types/card'

type CardItemProps = {
  card: Card
  collectionIds?: string[]
  wishlistIds?: string[]
  onAddToCollection?: (card: Card) => void
  onRemoveFromCollection?: (cardId: string) => void
  onAddToWishlist?: (card: Card) => void
  onRemoveFromWishlist?: (cardId: string) => void
}

export function CardItem({
  card,
  collectionIds = [],
  wishlistIds = [],
  onAddToCollection,
  onRemoveFromCollection,
  onAddToWishlist,
  onRemoveFromWishlist,
}: CardItemProps) {
  const isSaved = card.inCollection || collectionIds.includes(card.id)
  const isWishlisted = wishlistIds.includes(card.id)

  return (
    <article className="card-item">
      <div className="card-item__image-wrap">
        <img className="card-item__image" src={card.imageUrl} alt={card.name} />
      </div>

      <div className="card-item__body">
        <div>
          <p className="card-item__set">{card.set}</p>
          <h2>{card.name}</h2>
        </div>

        <div className="card-item__details">
          <span>{card.type}</span>
          <span>{card.rarity}</span>
          <span>#{card.number}</span>
        </div>

        <div className="card-item__bottom">
          <p className="card-item__price">
            {card.price === null ? 'No price yet' : `$${card.price.toFixed(2)}`}
          </p>

          <div className="card-item__badges" aria-label="Card status">
            {card.forTrade && <span className="badge badge--trade">Trade</span>}
            {card.forSale && <span className="badge badge--sale">Sale</span>}
          </div>
        </div>

        <span className="card-item__status">
          {isSaved ? 'In collection' : 'Not owned'}
        </span>

        {onAddToCollection && (
          <button
            className="card-item__button"
            type="button"
            onClick={() => onAddToCollection(card)}
            disabled={isSaved}
          >
            {isSaved ? 'Added to collection' : 'Add to my collection'}
          </button>
        )}

        {onAddToWishlist && (
          <button
            className="card-item__button card-item__button--wishlist"
            type="button"
            onClick={() => onAddToWishlist(card)}
            disabled={isWishlisted}
          >
            {isWishlisted ? '♥ In wishlist' : '♡ Add to wishlist'}
          </button>
        )}

        {onRemoveFromCollection && (
          <button
            className="card-item__button card-item__button--danger"
            type="button"
            onClick={() => onRemoveFromCollection(card.id)}
          >
            Remove
          </button>
        )}

        {onRemoveFromWishlist && (
          <button
            className="card-item__button card-item__button--danger"
            type="button"
            onClick={() => onRemoveFromWishlist(card.id)}
          >
            Remove
          </button>
        )}
      </div>
    </article>
  )
}
