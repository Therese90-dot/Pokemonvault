import type { Card } from '../../types/card'

type CardItemProps = {
  card: Card
  collectionIds?: string[]
  collectionQuantities?: Record<string, number>
  wishlistIds?: string[]
  tradeIds?: string[]
  onAddToCollection?: (card: Card) => void
  onRemoveFromCollection?: (cardId: string) => void
  onDecreaseCollectionQuantity?: (cardId: string) => void
  onAddToWishlist?: (card: Card) => void
  onRemoveFromWishlist?: (cardId: string) => void
  onAddToTrade?: (card: Card) => void
  onRemoveFromTrade?: (cardId: string) => void
}

export function CardItem({
  card,
  collectionIds = [],
  collectionQuantities = {},
  wishlistIds = [],
  tradeIds = [],
  onAddToCollection,
  onRemoveFromCollection,
  onDecreaseCollectionQuantity,
  onAddToWishlist,
  onRemoveFromWishlist,
  onAddToTrade,
  onRemoveFromTrade,
}: CardItemProps) {
  const isSaved = card.inCollection || collectionIds.includes(card.id)
  const isWishlisted = wishlistIds.includes(card.id)
  const isInTradeList = tradeIds.includes(card.id)
  const quantity = card.quantity ?? collectionQuantities[card.id] ?? (isSaved ? 1 : 0)

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
          {isSaved ? `Owned x${quantity}` : 'Not owned'}
        </span>

        {onAddToCollection && (
          <button
            className="card-item__button"
            type="button"
            onClick={() => {
              if (isSaved && onRemoveFromCollection) {
                onRemoveFromCollection(card.id)
              } else {
                onAddToCollection(card)
              }
            }}
          >
            {isSaved ? 'Remove from my collection' : 'Add to my collection'}
          </button>
        )}

        {onDecreaseCollectionQuantity && (
          <div className="quantity-controls" aria-label="Collection quantity">
            <button
              type="button"
              onClick={() => onDecreaseCollectionQuantity(card.id)}
            >
              -
            </button>
            <span>{quantity}</span>
            <button type="button" onClick={() => onAddToCollection?.(card)}>
              +
            </button>
          </div>
        )}

        {onAddToWishlist && (
          <button
            className="card-item__button card-item__button--wishlist"
            type="button"
            onClick={() => {
              if (isWishlisted && onRemoveFromWishlist) {
                onRemoveFromWishlist(card.id)
              } else {
                onAddToWishlist(card)
              }
            }}
          >
            {isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
          </button>
        )}

        {onAddToTrade && (
          <button
            className="card-item__button card-item__button--trade"
            type="button"
            onClick={() => {
              if (isInTradeList && onRemoveFromTrade) {
                onRemoveFromTrade(card.id)
              } else {
                onAddToTrade(card)
              }
            }}
          >
            {isInTradeList ? 'Remove from trade' : 'Add to trade'}
          </button>
        )}

        {onRemoveFromCollection && !onAddToCollection && (
          <button
            className="card-item__button card-item__button--danger"
            type="button"
            onClick={() => onRemoveFromCollection(card.id)}
          >
            Remove
          </button>
        )}

        {onRemoveFromWishlist && !onAddToWishlist && (
          <button
            className="card-item__button card-item__button--danger"
            type="button"
            onClick={() => onRemoveFromWishlist(card.id)}
          >
            Remove
          </button>
        )}

        {onRemoveFromTrade && !onAddToTrade && (
          <button
            className="card-item__button card-item__button--danger"
            type="button"
            onClick={() => onRemoveFromTrade(card.id)}
          >
            Remove from trade
          </button>
        )}
      </div>
    </article>
  )
}
