import { createClient } from '../supabase/client'

export interface PrayerChecklist {
  id?: string
  user_id?: string
  prayer_date: string
  fajr_done: boolean
  dhuhr_done: boolean
  asr_done: boolean
  maghrib_done: boolean
  isha_done: boolean
  notes?: string
}

export async function getPrayerChecklist(dateStr: string): Promise<PrayerChecklist | null> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data, error } = await supabase
    .from('prayer_checklists')
    .select('*')
    .eq('prayer_date', dateStr)
    .maybeSingle()

  if (error) {
    console.error('Error fetching prayer checklist:', error)
    return null
  }
  return data
}

export async function upsertPrayerChecklist(
  dateStr: string,
  updates: Partial<Omit<PrayerChecklist, 'id' | 'user_id' | 'prayer_date'>>
): Promise<PrayerChecklist | null> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  // Try to fetch existing first
  const existing = await getPrayerChecklist(dateStr)

  if (existing) {
    const { data, error } = await supabase
      .from('prayer_checklists')
      .update(updates)
      .eq('id', existing.id)
      .select()
      .single()

    if (error) {
      console.error('Error updating prayer checklist:', error)
      return null
    }
    return data
  } else {
    // Insert new
    const newRecord = {
      user_id: user.id,
      prayer_date: dateStr,
      fajr_done: updates.fajr_done ?? false,
      dhuhr_done: updates.dhuhr_done ?? false,
      asr_done: updates.asr_done ?? false,
      maghrib_done: updates.maghrib_done ?? false,
      isha_done: updates.isha_done ?? false,
      notes: updates.notes ?? '',
    }

    const { data, error } = await supabase
      .from('prayer_checklists')
      .insert([newRecord])
      .select()
      .single()

    if (error) {
      console.error('Error inserting prayer checklist:', error)
      return null
    }
    return data
  }
}
