'use client'

import React, { useState, useEffect } from 'react'
import { getPrayerChecklist, upsertPrayerChecklist, getPrayerHistoryRange, PrayerChecklist } from '@/lib/db/prayerChecklist'
import { getPrayerAndHijriData, PrayerData } from '@/lib/api/aladhan'

export function PrayerTab() {
  const [checklist, setChecklist] = useState<PrayerChecklist | null>(null)
  const [prayerData, setPrayerData] = useState<PrayerData | null>(null)
  const [history, setHistory] = useState<PrayerChecklist[]>([])
  const [loading, setLoading] = useState(true)
  const [actionId, setActionId] = useState<string | null>(null)

  const today = new Date()
  const todayStr = today.toISOString().split('T')[0]

  // Calculate past 7 days range
  const past7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date()
    d.setDate(today.getDate() - i)
    return d.toISOString().split('T')[0]
  }).reverse()

  const loadData = async () => {
    setLoading(true)
    const checklistData = await getPrayerChecklist(todayStr)
    setChecklist(checklistData)
    
    // Fetch last 7 days history
    const historyData = await getPrayerHistoryRange(past7Days[0], todayStr)
    setHistory(historyData)
    
    // Default Jakarta coordinates
    const prData = await getPrayerAndHijriData(-6.2088, 106.8456)
    setPrayerData(prData)
    
    setLoading(false)
  }

  useEffect(() => {
    loadData()
  }, [todayStr])

  const handleToggle = async (prayer: keyof Omit<PrayerChecklist, 'id' | 'user_id' | 'prayer_date' | 'notes'>) => {
    setActionId(prayer)
    const nextVal = checklist ? !checklist[prayer] : true
    const updated = await upsertPrayerChecklist(todayStr, { [prayer]: nextVal })
    if (updated) {
      setChecklist(updated)
      // Refresh history data
      const historyData = await getPrayerHistoryRange(past7Days[0], todayStr)
      setHistory(historyData)
    }
    setActionId(null)
  }

  const wajibPrayers: { id: keyof Omit<PrayerChecklist, 'id' | 'user_id' | 'prayer_date' | 'notes'>; label: string; timeKey: string }[] = [
    { id: 'fajr_done', label: 'Subuh', timeKey: 'Fajr' },
    { id: 'dhuhr_done', label: 'Dzuhur', timeKey: 'Dhuhr' },
    { id: 'asr_done', label: 'Ashar', timeKey: 'Asr' },
    { id: 'maghrib_done', label: 'Maghrib', timeKey: 'Maghrib' },
    { id: 'isha_done', label: 'Isya', timeKey: 'Isha' },
  ]

  const sunnahPrayers: { id: keyof Omit<PrayerChecklist, 'id' | 'user_id' | 'prayer_date' | 'notes'>; label: string; desc: string }[] = [
    { id: 'tahajjud_done', label: 'Tahajjud', desc: 'Sepertiga malam terakhir' },
    { id: 'duha_done', label: 'Duha', desc: 'Pagi hari setelah matahari terbit' },
    { id: 'witir_done', label: 'Witir', desc: 'Shalat penutup malam' },
  ]

  return (
    <div className="space-y-6 animate-fade-in md:grid md:grid-cols-3 md:gap-6 md:space-y-0">
      
      {/* Left Column: Schedule and Shalat Wajib/Sunnah */}
      <div className="md:col-span-2 space-y-6">
        <h2 className="text-xl font-bold text-gray-800 hidden md:block">Ibadah & Jadwal Shalat</h2>

        {/* Prayer Schedule */}
        {prayerData && (
          <div className="p-5 bg-emerald-50 rounded-[2rem] border border-emerald-100/60 shadow-sm space-y-3">
            <p className="text-xs font-semibold text-emerald-800">Jadwal Shalat Hari Ini ({prayerData.date.hijri.date} H)</p>
            <div className="grid grid-cols-5 gap-2 text-center">
              {wajibPrayers.map((p) => (
                <div key={p.id} className="bg-white p-2.5 rounded-2xl border border-emerald-100/50">
                  <p className="text-[10px] text-gray-500 font-bold">{p.label}</p>
                  <p className="text-xs font-black text-emerald-700 mt-0.5">
                    {prayerData.timings[p.timeKey as keyof typeof prayerData.timings] || '--:--'}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex flex-col items-center py-10 space-y-2">
            <div className="w-6 h-6 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin" />
            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider animate-pulse">Memuat...</span>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Shalat Wajib List */}
            <div className="space-y-2.5">
              <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest px-1">Shalat Wajib (5 Waktu)</h3>
              {wajibPrayers.map((p) => {
                const isDone = checklist ? checklist[p.id] : false
                const isToggling = actionId === p.id
                return (
                  <div
                    key={p.id}
                    onClick={() => !isToggling && handleToggle(p.id)}
                    className="flex items-center justify-between p-4 bg-white rounded-2xl border border-gray-100 hover:shadow-sm transition cursor-pointer transform active:scale-[0.99] select-none"
                  >
                    <div className="flex items-center space-x-3.5">
                      <span className="text-xl">🕌</span>
                      <div>
                        <h4 className="text-sm font-bold text-gray-800">{p.label}</h4>
                        <p className="text-[10px] text-gray-400">Tekan untuk mengubah status catatan</p>
                      </div>
                    </div>
                    <div
                      className={`w-6 h-6 rounded-xl border flex items-center justify-center text-xs transition-all duration-300 ${
                        isDone ? 'bg-emerald-500 border-emerald-500 text-white shadow-md shadow-emerald-500/20' : 'border-gray-200'
                      }`}
                    >
                      {isToggling ? (
                        <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : isDone ? (
                        '✓'
                      ) : (
                        ''
                      )}
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Shalat Sunnah List */}
            <div className="space-y-2.5">
              <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest px-1">Shalat Sunnah</h3>
              {sunnahPrayers.map((p) => {
                const isDone = checklist ? checklist[p.id] : false
                const isToggling = actionId === p.id
                return (
                  <div
                    key={p.id}
                    onClick={() => !isToggling && handleToggle(p.id)}
                    className="flex items-center justify-between p-4 bg-white rounded-2xl border border-gray-100 hover:shadow-sm transition cursor-pointer transform active:scale-[0.99] select-none"
                  >
                    <div className="flex items-center space-x-3.5">
                      <span className="text-xl">✨</span>
                      <div>
                        <h4 className="text-sm font-bold text-gray-800">{p.label}</h4>
                        <p className="text-[10px] text-gray-400">{p.desc}</p>
                      </div>
                    </div>
                    <div
                      className={`w-6 h-6 rounded-xl border flex items-center justify-center text-xs transition-all duration-300 ${
                        isDone ? 'bg-emerald-500 border-emerald-500 text-white shadow-md shadow-emerald-500/20' : 'border-gray-200'
                      }`}
                    >
                      {isToggling ? (
                        <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : isDone ? (
                        '✓'
                      ) : (
                        ''
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>

      {/* Right Column: Weekly History Stats */}
      <div className="md:col-span-1 space-y-4">
        <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest px-1">Statistik 7 Hari Terakhir</h3>
        <div className="bg-white/70 backdrop-blur-md p-5 rounded-[2rem] border border-gray-100 shadow-sm space-y-4">
          <p className="text-[10px] text-gray-400 font-medium">Melacak keteraturan ibadah harian Anda</p>
          
          <div className="space-y-3">
            {past7Days.map((dateStr) => {
              const dayRecord = history.find(h => h.prayer_date === dateStr)
              const dateObj = new Date(dateStr)
              const dateLabel = dateObj.toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric' })
              
              // Count completed prayers
              const doneCount = dayRecord 
                ? [
                    dayRecord.fajr_done,
                    dayRecord.dhuhr_done,
                    dayRecord.asr_done,
                    dayRecord.maghrib_done,
                    dayRecord.isha_done,
                    dayRecord.tahajjud_done,
                    dayRecord.duha_done,
                    dayRecord.witir_done
                  ].filter(Boolean).length
                : 0

              const percent = Math.min(Math.round((doneCount / 8) * 100), 100)

              return (
                <div key={dateStr} className="space-y-1">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-gray-700">{dateLabel}</span>
                    <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                      {doneCount} Done
                    </span>
                  </div>
                  <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                    <div 
                      className="bg-emerald-500 h-full rounded-full transition-all duration-500" 
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

    </div>
  )
}
