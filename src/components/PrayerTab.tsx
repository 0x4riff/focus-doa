'use client'

import React, { useState, useEffect } from 'react'
import { getPrayerChecklist, upsertPrayerChecklist, PrayerChecklist } from '@/lib/db/prayerChecklist'
import { getPrayerAndHijriData, PrayerData } from '@/lib/api/aladhan'

export function PrayerTab() {
  const [checklist, setChecklist] = useState<PrayerChecklist | null>(null)
  const [prayerData, setPrayerData] = useState<PrayerData | null>(null)
  const [loading, setLoading] = useState(true)

  const todayStr = new Date().toISOString().split('T')[0]

  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      const checklistData = await getPrayerChecklist(todayStr)
      setChecklist(checklistData)
      
      // Default Jakarta coordinates
      const prData = await getPrayerAndHijriData(-6.2088, 106.8456)
      setPrayerData(prData)
      
      setLoading(false)
    }
    loadData()
  }, [todayStr])

  const handleToggle = async (prayer: keyof Omit<PrayerChecklist, 'id' | 'user_id' | 'prayer_date' | 'notes'>) => {
    const nextVal = checklist ? !checklist[prayer] : true
    const updated = await upsertPrayerChecklist(todayStr, { [prayer]: nextVal })
    if (updated) setChecklist(updated)
  }

  const prayers: { id: keyof Omit<PrayerChecklist, 'id' | 'user_id' | 'prayer_date' | 'notes'>; label: string; timeKey: string }[] = [
    { id: 'fajr_done', label: 'Subuh', timeKey: 'Fajr' },
    { id: 'dhuhr_done', label: 'Dzuhur', timeKey: 'Dhuhr' },
    { id: 'asr_done', label: 'Ashar', timeKey: 'Asr' },
    { id: 'maghrib_done', label: 'Maghrib', timeKey: 'Maghrib' },
    { id: 'isha_done', label: 'Isya', timeKey: 'Isha' },
  ]

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-gray-800">Ibadah & Jadwal Shalat</h2>

      {prayerData && (
        <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
          <p className="text-xs font-semibold text-emerald-800">Jadwal Shalat Hari Ini ({prayerData.date.hijri.date} H)</p>
          <div className="grid grid-cols-5 gap-2 mt-3 text-center">
            {prayers.map((p) => (
              <div key={p.id} className="bg-white p-2 rounded-xl border border-emerald-100">
                <p className="text-[10px] text-gray-500 font-medium">{p.label}</p>
                <p className="text-xs font-bold text-emerald-700 mt-0.5">
                  {prayerData.timings[p.timeKey as keyof typeof prayerData.timings] || '--:--'}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {loading ? (
        <div className="text-center text-sm text-gray-500">Memuat status ibadah...</div>
      ) : (
        <div className="space-y-2">
          {prayers.map((p) => {
            const isDone = checklist ? checklist[p.id] : false
            return (
              <div
                key={p.id}
                onClick={() => handleToggle(p.id)}
                className="flex items-center justify-between p-4 bg-white rounded-xl border border-gray-100 hover:shadow-sm transition cursor-pointer"
              >
                <div className="flex items-center space-x-3">
                  <span className="text-lg">🕌</span>
                  <div>
                    <h3 className="text-sm font-semibold text-gray-800">{p.label}</h3>
                    <p className="text-[10px] text-gray-400">Ketuk untuk ubah status</p>
                  </div>
                </div>
                <div
                  className={`w-6 h-6 rounded-full border flex items-center justify-center text-xs transition-colors ${
                    isDone ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-gray-300'
                  }`}
                >
                  {isDone ? '✓' : ''}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
