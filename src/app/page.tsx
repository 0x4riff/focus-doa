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

  const tabs = [
    { id: 'dashboard', label: 'Home', icon: '🏠' },
    { id: 'planner', label: 'Plan', icon: '🎯' },
    { id: 'prayer', label: 'Shalat', icon: '🕌' },
    { id: 'dua', label: 'Doa', icon: '📖' },
    { id: 'notes', label: 'Catat', icon: '✏️' },
    { id: 'reminders', label: 'Ingat', icon: '⏰' },
    { id: 'settings', label: 'Profil', icon: '⚙️' }
  ]

  // Logged in -> Responsive Hybrid Layout (Sidebar for desktop, bottom navigation for mobile)
  return (
    <div className="min-h-screen bg-gray-50/30 text-gray-800 flex flex-col md:flex-row">
      
      {/* Sidebar for Desktop (md and up) */}
      <aside className="hidden md:flex md:w-64 bg-white border-r border-gray-100 flex-col fixed h-full z-40">
        <div className="p-6 border-b border-gray-100 flex items-center space-x-3">
          <span className="text-2xl">🌱</span>
          <h1 className="text-lg font-black text-gray-900 tracking-tight">Focus & Doa</h1>
        </div>
        <nav className="flex-1 p-4 space-y-1.5">
          {tabs.map((tab) => {
            const isActive = currentTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => setCurrentTab(tab.id)}
                className={`w-full flex items-center space-x-3.5 px-4 py-3 rounded-2xl text-sm font-semibold tracking-wide transition-all ${
                  isActive 
                    ? 'bg-emerald-50 text-emerald-700 shadow-sm border border-emerald-100/50' 
                    : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <span className="text-lg">{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            )
          })}
        </nav>
      </aside>

      {/* Main Layout Wrapper */}
      <div className="flex-1 flex flex-col md:pl-64 min-h-screen pb-24 md:pb-0">
        {/* Top Header (Mobile: visible, Desktop: hidden or minimal) */}
        <header className="bg-white border-b border-gray-100/80 sticky top-0 z-40 backdrop-blur-md md:hidden">
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

        {/* Dynamic Desktop Page Title */}
        <header className="hidden md:block bg-white border-b border-gray-100/50 py-5 px-8 sticky top-0 z-40 backdrop-blur-md">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-bold text-gray-800 capitalize tracking-wide flex items-center gap-2">
              <span>{tabs.find(t => t.id === currentTab)?.icon}</span>
              <span>{tabs.find(t => t.id === currentTab)?.label}</span>
            </h2>
            <span className="text-xs text-gray-400 font-medium bg-gray-50 border border-gray-100 px-3 py-1 rounded-xl">
              Web Mode
            </span>
          </div>
        </header>

        {/* Page Content Container: mobile is narrow max-w-md, desktop spreads wider for larger screens */}
        <main className="max-w-md md:max-w-4xl mx-auto w-full px-6 py-6 md:py-8">
          {currentTab === 'dashboard' && <DashboardTab />}
          {currentTab === 'planner' && <PlannerTab />}
          {currentTab === 'prayer' && <PrayerTab />}
          {currentTab === 'dua' && <DuaTab />}
          {currentTab === 'notes' && <NotesTab />}
          {currentTab === 'reminders' && <RemindersTab />}
          {currentTab === 'settings' && <SettingsTab />}
        </main>
      </div>

      {/* Bottom Navigation for Mobile (md and below) */}
      <div className="md:hidden">
        <Navigation currentTab={currentTab} setCurrentTab={setCurrentTab} />
      </div>
    </div>
  )
}
