import { createClient } from '../supabase/client'

export interface DailyPlan {
  id?: string
  user_id?: string
  plan_date: string
  title: string
  description?: string
  priority: 'low' | 'medium' | 'high'
  status: 'todo' | 'in_progress' | 'done'
  created_at?: string
  updated_at?: string
}

export async function getDailyPlans(dateStr: string): Promise<DailyPlan[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('daily_plans')
    .select('*')
    .eq('plan_date', dateStr)
    .order('created_at', { ascending: true })

  if (error) {
    console.error('Error fetching plans:', error)
    return []
  }
  return data || []
}

export async function createDailyPlan(plan: Omit<DailyPlan, 'id' | 'user_id'>): Promise<DailyPlan | null> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data, error } = await supabase
    .from('daily_plans')
    .insert([{ ...plan, user_id: user.id }])
    .select()
    .single()

  if (error) {
    console.error('Error creating plan:', error)
    return null
  }
  return data
}

export async function updateDailyPlan(id: string, updates: Partial<Omit<DailyPlan, 'id' | 'user_id'>>): Promise<boolean> {
  const supabase = createClient()
  const { error } = await supabase
    .from('daily_plans')
    .update(updates)
    .eq('id', id)

  if (error) {
    console.error('Error updating plan:', error)
    return false
  }
  return true
}

export async function deleteDailyPlan(id: string): Promise<boolean> {
  const supabase = createClient()
  const { error } = await supabase
    .from('daily_plans')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Error deleting plan:', error)
    return false
  }
  return true
}
