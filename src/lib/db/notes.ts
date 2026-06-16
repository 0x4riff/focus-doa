import { createClient } from '../supabase/client'

export interface Note {
  id?: string
  user_id?: string
  title: string
  body: string
  category: string
  note_date: string
  is_archived: boolean
  created_at?: string
  updated_at?: string
}

export async function getNotes(): Promise<Note[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('notes')
    .select('*')
    .eq('is_archived', false)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching notes:', error)
    return []
  }
  return data || []
}

export async function createNote(note: Omit<Note, 'id' | 'user_id' | 'is_archived'>): Promise<Note | null> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data, error } = await supabase
    .from('notes')
    .insert([{ ...note, user_id: user.id, is_archived: false }])
    .select()
    .single()

  if (error) {
    console.error('Error creating note:', error)
    return null
  }
  return data
}

export async function updateNote(id: string, updates: Partial<Omit<Note, 'id' | 'user_id'>>): Promise<boolean> {
  const supabase = createClient()
  const { error } = await supabase
    .from('notes')
    .update(updates)
    .eq('id', id)

  if (error) {
    console.error('Error updating note:', error)
    return false
  }
  return true
}

export async function deleteNote(id: string): Promise<boolean> {
  const supabase = createClient()
  const { error } = await supabase
    .from('notes')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Error deleting note:', error)
    return false
  }
  return true
}
