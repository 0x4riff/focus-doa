import { createClient } from '../supabase/client'

export async function getFavoriteDuas(): Promise<string[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('favorite_duas')
    .select('dua_id')

  if (error) {
    console.error('Error fetching favorite duas:', error)
    return []
  }
  return (data || []).map((row: { dua_id: string }) => row.dua_id)
}

export async function toggleFavoriteDua(duaId: string, isFav: boolean): Promise<boolean> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return false

  if (isFav) {
    // Add favorite
    const { error } = await supabase
      .from('favorite_duas')
      .insert([{ user_id: user.id, dua_id: duaId }])
    
    if (error && error.code !== '23505') { // Ignore unique constraint duplicate error
      console.error('Error adding favorite:', error)
      return false
    }
  } else {
    // Remove favorite
    const { error } = await supabase
      .from('favorite_duas')
      .delete()
      .eq('user_id', user.id)
      .eq('dua_id', duaId)

    if (error) {
      console.error('Error removing favorite:', error)
      return false
    }
  }
  return true
}
