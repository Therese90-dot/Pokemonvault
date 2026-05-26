import { fetchCardsByIds } from './pokemonApi'
import { supabase } from './supabase'

type SavedCardRow = {
  card_id: string
}

export async function getTradeCards(userId: string) {
  const { data, error } = await supabase
    .from('trade_cards')
    .select('card_id')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) {
    throw error
  }

  const rows = (data ?? []) as SavedCardRow[]
  const cards = await fetchCardsByIds(rows.map((row) => row.card_id))

  return cards.map((card) => ({
    ...card,
    forTrade: true,
  }))
}

export async function getTradeCardCount(userId: string) {
  const { count, error } = await supabase
    .from('trade_cards')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)

  if (error) {
    throw error
  }

  return count ?? 0
}

export async function addCardToTrade(userId: string, cardId: string) {
  const { data: existingCard, error: existingError } = await supabase
    .from('trade_cards')
    .select('id')
    .eq('user_id', userId)
    .eq('card_id', cardId)
    .maybeSingle()

  if (existingError) {
    throw existingError
  }

  if (!existingCard) {
    const { error } = await supabase.from('trade_cards').insert({
      user_id: userId,
      card_id: cardId,
    })

    if (error) {
      throw error
    }
  }

  return getTradeCards(userId)
}

export async function removeCardFromTrade(userId: string, cardId: string) {
  const { error } = await supabase
    .from('trade_cards')
    .delete()
    .eq('user_id', userId)
    .eq('card_id', cardId)

  if (error) {
    throw error
  }

  return getTradeCards(userId)
}
