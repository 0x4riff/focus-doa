'use client'

import React, { useState, useEffect } from 'react'
import { getJavaneseDate } from '@/utils/javaneseCalendar'
import { calculateChoghadiya, ChoghadiyaPeriod } from '@/utils/choghadiya'
import { getPrayerAndHijriData, PrayerData } from '@/lib/api/aladhan'

export function DashboardTab() {
  const [javDate, setJavDate] = useState<{ hari: string; pasaran: string; weton: string } | null>(null)
  const [choghadiya, setChoghadiya] = useState<{ day: ChoghadiyaPeriod[]; night: ChoghadiyaPeriod[] } | null>(null)
  const [prayerData, setPrayerData] = useState<PrayerData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    setLoading(true)
    const today = new Date()
    
    // 1. Javanese date
    setJavDate(getJavaneseDate(today))
    
    // 2. Prayer times & Hijri
    // Use Jakarta fallback coordinate
    const prData = await getPrayerAndHijriData(-6.2088, 106.8456)
    setPrayerData(prData)

    // 3. Choghadiya
    if (prData) {
      // Clean timings by stripping timezone info if present (e.g. "04:45 (WIB)")
      const cleanTime = (t: string) => t.split(' ')[0]
      const sunrise = cleanTime(prData.timings.Sunrise)
      const sunset = cleanTime(prData.timings.Sunset)
      setChoghadiya(calculateChoghadiya(today, sunrise, sunset))
    } else {
      setChoghadiya(calculateChoghadiya(today))
    }
    
    setLoading(false)
  }

  if (loading) {
    return <div className="text-center py-10 text-sm text-gray-500">Memuat dashboard...</div>
  }

  const today = new Date()
  const masehiStr = today.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="bg-emerald-600 text-white p-5 rounded-3xl space-y-2">
        <p className="text-xs font-medium opacity-90">Muslim Daily Focus & Productivity</p>
        <h2 className="text-xl font-bold">{masehiStr}</h2>
        {prayerData && javDate && (
          <div className="flex flex-wrap gap-2 text-xs pt-1.5 opacity-95">
            <span className="bg-emerald-700/50 px-2.5 py-1 rounded-full">
              🌙 {prayerData.date.hijri.day} {prayerData.date.hijri.month.en} {prayerData.date.hijri.year} H
            </span>
            <span className="bg-emerald-700/50 px-2.5 py-1 rounded-full">
              🌾 {javDate.hari} {javDate.pasaran}
            </span>
          </div>
        )}
      </div>

      {/* Prayer Schedule Widget */}
      {prayerData && (
        <div className="bg-white p-4 rounded-2xl border border-gray-100 space-y-3">
          <h3 className="text-xs font-bold text-gray-500">Jadwal Shalat</h3>
          <div className="grid grid-cols-5 gap-2 text-center">
            {[
              { label: 'Subuh', key: 'Fajr' },
              { label: 'Dzuhur', key: 'Dhuhr' },
              { label: 'Ashar', key: 'Asr' },
              { label: 'Maghrib', key: 'Maghrib' },
              { label: 'Isya', key: 'Isha' },
            ].map((pr) => (
              <div key={pr.key} className="bg-gray-50 p-2 rounded-xl">
                <p className="text-[10px] text-gray-500 font-medium">{pr.label}</p>
                <p className="text-xs font-bold text-emerald-600 mt-0.5">
                  {prayerData.timings[pr.key as keyof typeof prayerData.timings] || '--:--'}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Focus Time / Choghadiya Widget */}
      {choghadiya && (
        <div className="bg-white p-4 rounded-2xl border border-gray-100 space-y-3">
          <div>
            <h3 className="text-xs font-bold text-gray-500">Pembagian Waktu Fokus (Choghadiya)</h3>
            <p className="text-[10px] text-gray-400 mt-0.5">Mengatur prioritas berdasarkan siklus jam harian</p>
          </div>
          
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {choghadiya.day.map((p, idx) => {
              const borderColors = {
                excellent: 'border-l-emerald-500',
                good: 'border-l-teal-500',
                beneficial: 'border-l-cyan-500',
                neutral: 'border-l-blue-400',
                rest: 'border-l-amber-500',
                review: 'border-l-indigo-400',
                reflect: 'border-l-purple-500',
              }

              return (
                <div key={idx} className={`p-2.5 bg-gray-50 rounded-xl border-l-4 ${borderColors[p.quality]} flex justify-between items-center text-xs`}>
                  <div>
                    <p className="font-semibold text-gray-800">{p.label}</p>
                    <p className="text-[10px] text-gray-400 mt-0.5">Siang • Periode ke-{idx + 1}</p>
                  </div>
                  <p className="font-medium text-gray-600 bg-white px-2 py-0.5 rounded border border-gray-100">
                    {p.start} - {p.end}
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
