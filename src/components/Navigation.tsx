import React from 'react'

export interface NavigationProps {
  currentTab: string
  setCurrentTab: (tab: string) => void
}

export function Navigation({ currentTab, setCurrentTab }: NavigationProps) {
  const tabs = [
    { id: 'dashboard', label: 'Home', icon: '🏠' },
    { id: 'planner', label: 'Plan', icon: '🎯' },
    { id: 'prayer', label: 'Shalat', icon: '🕌' },
    { id: 'dua', label: 'Doa', icon: '📖' },
    { id: 'notes', label: 'Catat', icon: '✏️' },
    { id: 'reminders', label: 'Ingat', icon: '⏰' },
    { id: 'settings', label: 'Profil', icon: '⚙️' }
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-md border-t border-gray-100 z-50">
      <div className="max-w-md mx-auto flex justify-around items-center h-20 px-4">
        {tabs.map((tab) => {
          const isActive = currentTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => setCurrentTab(tab.id)}
              className={`flex flex-col items-center justify-center flex-1 h-full transition-all relative ${
                isActive ? 'text-emerald-600 scale-105 font-bold' : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <span className="text-xl mb-1">{tab.icon}</span>
              <span className="text-[10px] tracking-wide font-medium">{tab.label}</span>
              {isActive && (
                <span className="absolute bottom-1 w-1.5 h-1.5 bg-emerald-600 rounded-full" />
              )}
            </button>
          )
        })}
      </div>
    </nav>
  )
}
