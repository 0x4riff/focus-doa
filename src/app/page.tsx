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
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      setSession(currentSession)
      setCheckingAuth(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession)
      setCheckingAuth(false)
    })

    return () => subscription.unsubscribe()
  }, [supabase.auth])

  if (checkingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50/50">
        <div className="flex flex-col items-center space-y-4">
          <div className="relative flex items-center justify-center">
            <span className="text-3xl animate-bounce">🌱</span>
          </div>
          <div className="text-xs font-bold tracking-widest text-emerald-800 uppercase animate-pulse">
            Memuat aplikasi...
          </div>
        </div>
      </div>
    )
  }

  // Not logged in -> Clean & Minimalist Landing Page (Not AI generated style)
  if (!session) {
    return (
      <div className="min-h-screen flex flex-col justify-center py-12 px-6 bg-gradient-to-b from-emerald-50/30 via-white to-gray-50/20 text-gray-800">
        <div className="w-full max-w-md mx-auto flex flex-col items-center">
          <div className="flex flex-col items-center mb-8 text-center">
            <div className="w-16 h-16 bg-emerald-50 rounded-3xl flex items-center justify-center border border-emerald-100 shadow-sm mb-4">
              <span className="text-2xl">🌱</span>
            </div>
            <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Focus & Doa</h1>
            <p className="text-sm text-gray-500 mt-2 max-w-xs">
              Teman produktivitas harian yang menyelaraskan fokus kerja dan rutinitas ibadah harianmu.
            </p>
          </div>
          <AuthCard onLoginSuccess={() => window.location.reload()} />
        </div>
      </div>
    )
  }

  // Logged in -> Modern Mobile Layout
  return (
    <div className="min-h-screen bg-gray-50/30 pb-24 text-gray-800">
      <header className="bg-white border-b border-gray-100/80 sticky top-0 z-40 backdrop-blur-md">
        <div className="max-w-md mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2.5">
            <span className="text-xl">🌱</span>
            <h1 className="text-base font-extrabold text-gray-900 tracking-tight">Focus & Doa</h1>
          </div>
          <span className="text-[10px] font-bold tracking-wider uppercase px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-full">
            {currentTab}
          </span>
        </div>
      </header>

      <main className="max-w-md mx-auto px-6 py-6">
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
