'use client'

import React, { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Navigation } from '@/components/Navigation'
import { AuthCard } from '@/components/AuthCard'
import { DashboardTab } from '@/components/DashboardTab'
import { PlannerTab } from '@/components/PlannerTab'
import { PrayerTab } from '@/components/PrayerTab'
import { DuaTab } from '@/components/DuaTab'
import { NotesTab } from '@/components/NotesTab'
import { RemindersTab } from '@/components/RemindersTab'
import { SettingsTab } from '@/components/SettingsTab'

export default function Home() {
  const [session, setSession] = useState<unknown>(null)
  const [checkingAuth, setCheckingAuth] = useState(true)
  const [currentTab, setCurrentTab] = useState('dashboard')

  const supabase = createClient()

  useEffect(() => {
    // Check current session
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      setSession(currentSession)
      setCheckingAuth(false)
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession)
      setCheckingAuth(false)
    })

    return () => subscription.unsubscribe()
  }, [supabase.auth])

  if (checkingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center text-sm font-semibold text-gray-500">
          Memuat aplikasi...
        </div>
      </div>
    )
  }

  // Not logged in -> Show Auth Card
  if (!session) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gray-50">
        <div className="mb-6 text-center">
          <span className="text-4xl">🚀</span>
          <h1 className="text-xl font-extrabold text-gray-800 mt-2">Focus & Doa</h1>
          <p className="text-xs text-gray-500 mt-1">Muslim Daily Focus & Productivity Companion</p>
        </div>
        <AuthCard onLoginSuccess={() => window.location.reload()} />
      </div>
    )
  }

  // Logged in -> Show App layout
  return (
    <div className="min-h-screen bg-gray-50 pb-24 text-gray-800">
      <header className="bg-white border-b border-gray-100 sticky top-0 z-40">
        <div className="max-w-md mx-auto px-4 py-3.5 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <span className="text-xl">🚀</span>
            <h1 className="text-base font-extrabold text-emerald-600">Focus & Doa</h1>
          </div>
          <span className="text-xs font-semibold px-2 py-0.5 bg-gray-100 rounded-full text-gray-500 capitalize">
            {currentTab}
          </span>
        </div>
      </header>

      <main className="max-w-md mx-auto px-4 py-6">
        {currentTab === 'dashboard' && <DashboardTab />}
        {currentTab === 'planner' && <PlannerTab />}
        {currentTab === 'prayer' && <PrayerTab />}
        {currentTab === 'dua' && <DuaTab />}
        {currentTab === 'notes' && <NotesTab />}
        {currentTab === 'reminders' && <RemindersTab />}
        {currentTab === 'settings' && <SettingsTab />}
      </main>

      <Navigation currentTab={currentTab} setCurrentTab={setCurrentTab} />
    </div>
  )
}
