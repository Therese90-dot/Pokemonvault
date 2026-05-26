import { fetchCardsByIds } from './pokemonApi'
import { supabase } from './supabase'
import type { Card } from '../types/card'

type CollectionRow = {
  id: string
  user_id: string
  card_id: string
  quantity: number
  created_at: string
}

function addQuantityToCards(cards: Card[], rows: CollectionRow[]) {
  const quantityByCardId = Object.fromEntries(
    rows.map((row) => [row.card_id, row.quantity]),
  )

  return cards.map((card) => ({
    ...card,
    inCollection: true,
    quantity: quantityByCardId[card.id] ?? 1,
  }))
}

export async function getCollectionCards(userId: string) {
  const { data, error } = await supabase
    .from('my_collection')
    .select('id, user_id, card_id, quantity, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) {
    throw error
  }

  const rows = data ?? []
  const cards = await fetchCardsByIds(rows.map((row) => row.card_id))

  return addQuantityToCards(cards, rows)
}

export async function addCardToCollection(userId: string, card: Card) {
  const { data: existingCard, error: existingError } = await supabase
    .from('my_collection')
    .select('id, quantity')
    .eq('user_id', userId)
    .eq('card_id', card.id)
    .maybeSingle()

  if (existingError) {
    throw existingError
  }

  if (existingCard) {
    const { error } = await supabase
      .from('my_collection')
      .update({ quantity: existingCard.quantity + 1 })
      .eq('id', existingCard.id)
      .eq('user_id', userId)

    if (error) {
      throw error
    }
  } else {
    const { error } = await supabase.from('my_collection').insert({
      user_id: userId,
      card_id: card.id,
      quantity: 1,
    })

    if (error) {
      throw error
    }
  }

  return getCollectionCards(userId)
}

export async function decreaseCardQuantity(userId: string, cardId: string) {
  const { data: existingCard, error: existingError } = await supabase
    .from('my_collection')
    .select('id, quantity')
    .eq('user_id', userId)
    .eq('card_id', cardId)
    .maybeSingle()

  if (existingError) {
    throw existingError
  }

  if (!existingCard) {
    return getCollectionCards(userId)
  }

  if (existingCard.quantity <= 1) {
    const { error } = await supabase
      .from('my_collection')
      .delete()
      .eq('id', existingCard.id)
      .eq('user_id', userId)

    if (error) {
      throw error
    }
  } else {
    const { error } = await supabase
      .from('my_collection')
      .update({ quantity: existingCard.quantity - 1 })
      .eq('id', existingCard.id)
      .eq('user_id', userId)

    if (error) {
      throw error
    }
  }

  return getCollectionCards(userId)
}

export async function removeCardFromCollection(userId: string, cardId: string) {
  const { error } = await supabase
    .from('my_collection')
    .delete()
    .eq('user_id', userId)
    .eq('card_id', cardId)

  if (error) {
    throw error
  }

  return getCollectionCards(userId)
}
