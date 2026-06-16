import { createClient } from '../supabase/client'

export interface Reminder {
  id?: string
  user_id?: string
  title: string
  reminder_time: string // Format: "HH:MM:SS" or "HH:MM"
  message?: string
  active_days: number[] // e.g. [0, 1, 2, 3, 4, 5, 6]
  is_active: boolean
  created_at?: string
  updated_at?: string
}

export async function getReminders(): Promise<Reminder[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('reminders')
    .select('*')
    .order('reminder_time', { ascending: true })

  if (error) {
    console.error('Error fetching reminders:', error)
    return []
  }
  return data || []
}

export async function createReminder(reminder: Omit<Reminder, 'id' | 'user_id'>): Promise<Reminder | null> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data, error } = await supabase
    .from('reminders')
    .insert([{ ...reminder, user_id: user.id }])
    .select()
    .single()

  if (error) {
    console.error('Error creating reminder:', error)
    return null
  }
  return data
}

export async function updateReminder(id: string, updates: Partial<Omit<Reminder, 'id' | 'user_id'>>): Promise<boolean> {
  const supabase = createClient()
  const { error } = await supabase
    .from('reminders')
    .update(updates)
    .eq('id', id)

  if (error) {
    console.error('Error updating reminder:', error)
    return false
  }
  return true
}

export async function deleteReminder(id: string): Promise<boolean> {
  const supabase = createClient()
  const { error } = await supabase
    .from('reminders')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Error deleting reminder:', error)
    return false
  }
  return true
}
