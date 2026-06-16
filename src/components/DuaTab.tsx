'use client'

import React, { useState, useEffect } from 'react'
import { DUAS } from '@/data/duas'
import { getFavoriteDuas, toggleFavoriteDua } from '@/lib/db/favorites'

export function DuaTab() {
  const [favorites, setFavorites] = useState<string[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadFavorites()
  }, [])

  const loadFavorites = async () => {
    setLoading(true)
    const favs = await getFavoriteDuas()
    setFavorites(favs)
    setLoading(false)
  }

  const handleToggleFav = async (duaId: string) => {
    const isFav = favorites.includes(duaId)
    const success = await toggleFavoriteDua(duaId, !isFav)
    if (success) {
      setFavorites(prev => 
        isFav ? prev.filter(id => id !== duaId) : [...prev, duaId]
      )
    }
  }

  const filteredDuas = DUAS.filter(d => 
    d.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.translation.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-gray-800">Doa Harian & Ibadah</h2>

      <div>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Cari doa..."
          className="w-full px-4 py-2 border border-gray-200 rounded-xl outline-none text-gray-800 text-sm focus:ring-2 focus:ring-emerald-500"
        />
      </div>

      {loading ? (
        <div className="text-center text-sm text-gray-500">Memuat data...</div>
      ) : filteredDuas.length === 0 ? (
        <div className="text-center py-6 text-sm text-gray-400 bg-gray-50 rounded-2xl border border-dashed">
          Doa tidak ditemukan.
        </div>
      ) : (
        <div className="space-y-4">
          {filteredDuas.map((dua) => {
            const isFav = favorites.includes(dua.id)
            return (
              <div key={dua.id} className="p-4 bg-white rounded-2xl border border-gray-100 space-y-3">
                <div className="flex justify-between items-start">
                  <h3 className="text-sm font-bold text-gray-800">{dua.title}</h3>
                  <button
                    onClick={() => handleToggleFav(dua.id)}
                    className={`text-xs px-2 py-1 rounded-lg border font-semibold transition ${
                      isFav 
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-600'
                        : 'border-gray-200 text-gray-400 hover:text-gray-600'
                    }`}
                  >
                    {isFav ? '★ Favorit' : '☆ Favorit'}
                  </button>
                </div>
                <p className="text-right text-lg font-serif text-gray-900 leading-loose" dir="rtl">
                  {dua.arabic}
                </p>
                <p className="text-xs text-gray-600 italic font-medium leading-relaxed">
                  {dua.latin}
                </p>
                <p className="text-xs text-gray-500 leading-relaxed">
                  <strong>Artinya:</strong> {dua.translation}
                </p>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
