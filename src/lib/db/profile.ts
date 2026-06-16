import { createClient } from '../supabase/client'

export interface Profile {
  id: string
  full_name: string | null
  avatar_url: string | null
  date_of_birth: string | null
  timezone: string
  latitude: number | null
  longitude: number | null
  city: string | null
}

export async function getCurrentProfile(): Promise<Profile | null> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (error) {
    console.error('Error fetching profile:', error)
    return null
  }
  return data
}

export async function updateProfile(profile: Partial<Profile>): Promise<boolean> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return false

  const { error } = await supabase
    .from('profiles')
    .update(profile)
    .eq('id', user.id)

  if (error) {
    console.error('Error updating profile:', error)
    return false
  }
  return true
}
