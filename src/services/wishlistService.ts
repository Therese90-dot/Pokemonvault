import { fetchCardsByIds } from './pokemonApi'
import { supabase } from './supabase'

type SavedCardRow = {
  card_id: string
}

export async function getWishlistCards(userId: string) {
  const { data, error } = await supabase
    .from('wishlist')
    .select('card_id')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) {
    throw error
  }

  const rows = (data ?? []) as SavedCardRow[]

  return fetchCardsByIds(rows.map((row) => row.card_id))
}

export async function addCardToWishlist(userId: string, cardId: string) {
  const { data: existingCard, error: existingError } = await supabase
    .from('wishlist')
    .select('id')
    .eq('user_id', userId)
    .eq('card_id', cardId)
    .maybeSingle()

  if (existingError) {
    throw existingError
  }

  if (!existingCard) {
    const { error } = await supabase.from('wishlist').insert({
      user_id: userId,
      card_id: cardId,
    })

    if (error) {
      throw error
    }
  }

  return getWishlistCards(userId)
}

export async function removeCardFromWishlist(userId: string, cardId: string) {
  const { error } = await supabase
    .from('wishlist')
    .delete()
    .eq('user_id', userId)
    .eq('card_id', cardId)

  if (error) {
    throw error
  }

  return getWishlistCards(userId)
}
