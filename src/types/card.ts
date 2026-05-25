export type CardSeries = 'Scarlet & Violet' | 'Mega Evolution'

export type Card = {
  id: string
  name: string
  setId: string
  set: string
  series: CardSeries
  number: string
  type: string
  rarity: string
  imageUrl: string
  price: number | null
  inCollection: boolean
  forTrade: boolean
  forSale: boolean
}
