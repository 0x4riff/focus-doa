import React from 'react'

export interface NavigationProps {
  currentTab: string
  setCurrentTab: (tab: string) => void
}

export function Navigation({ currentTab, setCurrentTab }: NavigationProps) {
  const tabs = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'planner', label: 'Planner' },
    { id: 'prayer', label: 'Ibadah' },
    { id: 'dua', label: 'Doa' },
    { id: 'notes', label: 'Catatan' },
    { id: 'reminders', label: 'Reminder' },
    { id: 'settings', label: 'Pengaturan' }
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
      <div className="max-w-md mx-auto flex justify-around items-center h-16 px-2">
        {tabs.map((tab) => {
          const isActive = currentTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => setCurrentTab(tab.id)}
              className={`flex flex-col items-center justify-center flex-1 h-full text-xs font-medium transition-colors ${
                isActive ? 'text-emerald-600' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <span className="capitalize">{tab.label}</span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
