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
  const [activeSegment, setActiveSegment] = useState<'day' | 'night'>('day')
  const [currentPrayer, setCurrentPrayer] = useState<string>('')

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    setLoading(true)
    const today = new Date()
    
    // 1. Javanese date
    setJavDate(getJavaneseDate(today))
    
    // 2. Prayer times & Hijri
    const prData = await getPrayerAndHijriData(-6.2088, 106.8456)
    setPrayerData(prData)

    // 3. Choghadiya & Current Active Period
    if (prData) {
      const cleanTime = (t: string) => t.split(' ')[0]
      const sunrise = cleanTime(prData.timings.Sunrise)
      const sunset = cleanTime(prData.timings.Sunset)
      setChoghadiya(calculateChoghadiya(today, sunrise, sunset))

      // Determine current prayer
      const currentHour = today.getHours()
      const currentMinute = today.getMinutes()
      const parseTimeToMinutes = (timeStr: string) => {
        const [h, m] = cleanTime(timeStr).split(':').map(Number)
        return h * 60 + m
      }
      
      const nowMinutes = currentHour * 60 + currentMinute
      const timings = prData.timings
      const prayerMinutes = {
        Subuh: parseTimeToMinutes(timings.Fajr),
        Dzuhur: parseTimeToMinutes(timings.Dhuhr),
        Ashar: parseTimeToMinutes(timings.Asr),
        Maghrib: parseTimeToMinutes(timings.Maghrib),
        Isya: parseTimeToMinutes(timings.Isha)
      }

      if (nowMinutes >= prayerMinutes.Isya || nowMinutes < prayerMinutes.Subuh) {
        setCurrentPrayer('Isya')
        setActiveSegment('night')
      } else if (nowMinutes >= prayerMinutes.Maghrib) {
        setCurrentPrayer('Maghrib')
        setActiveSegment('night')
      } else if (nowMinutes >= prayerMinutes.Ashar) {
        setCurrentPrayer('Ashar')
        setActiveSegment('day')
      } else if (nowMinutes >= prayerMinutes.Dzuhur) {
        setCurrentPrayer('Dzuhur')
        setActiveSegment('day')
      } else {
        setCurrentPrayer('Subuh')
        setActiveSegment('day')
      }
    } else {
      setChoghadiya(calculateChoghadiya(today))
    }
    
    setLoading(false)
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-3">
        <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs text-gray-500 font-medium animate-pulse">Menyiapkan halaman...</p>
      </div>
    )
  }

  const today = new Date()
  const masehiStr = today.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })

  const cardColors: Record<ChoghadiyaPeriod['quality'], { bg: string; text: string; dot: string; labelBg: string }> = {
    excellent: { bg: 'bg-emerald-50/60 hover:bg-emerald-50', text: 'text-emerald-800', dot: 'bg-emerald-500', labelBg: 'bg-emerald-100/80 text-emerald-800' },
    good: { bg: 'bg-teal-50/60 hover:bg-teal-50', text: 'text-teal-800', dot: 'bg-teal-500', labelBg: 'bg-teal-100/80 text-teal-800' },
    beneficial: { bg: 'bg-cyan-50/60 hover:bg-cyan-50', text: 'text-cyan-800', dot: 'bg-cyan-500', labelBg: 'bg-cyan-100/80 text-cyan-800' },
    neutral: { bg: 'bg-blue-50/60 hover:bg-blue-50', text: 'text-blue-800', dot: 'bg-blue-500', labelBg: 'bg-blue-100/80 text-blue-800' },
    rest: { bg: 'bg-amber-50/60 hover:bg-amber-50', text: 'text-amber-800', dot: 'bg-amber-500', labelBg: 'bg-amber-100/80 text-amber-800' },
    review: { bg: 'bg-indigo-50/60 hover:bg-indigo-50', text: 'text-indigo-800', dot: 'bg-indigo-500', labelBg: 'bg-indigo-100/80 text-indigo-800' },
    reflect: { bg: 'bg-purple-50/60 hover:bg-purple-50', text: 'text-purple-800', dot: 'bg-purple-500', labelBg: 'bg-purple-100/80 text-purple-800' },
  }

  return (
    <div className="space-y-6 animate-fade-in md:space-y-0 md:grid md:grid-cols-3 md:gap-6">
      {/* Left side: Header info and Prayer Schedule */}
      <div className="space-y-6 md:col-span-2">
        {/* Modern Dashboard Header */}
        <div className="relative overflow-hidden bg-gradient-to-br from-emerald-800 via-emerald-700 to-teal-800 text-white p-7 rounded-[2.5rem] shadow-xl shadow-emerald-900/10">
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute -bottom-20 -left-20 w-52 h-52 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />

          <div className="relative space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[10px] tracking-widest font-extrabold uppercase bg-white/10 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/10">
                Muslim Daily Focus
              </span>
              <span className="text-2xl animate-pulse">🌱</span>
            </div>

            <div className="space-y-1">
              <h2 className="text-2xl font-black tracking-tight">{masehiStr}</h2>
              {prayerData && javDate && (
                <div className="flex flex-wrap gap-2 text-xs pt-2">
                  <span className="bg-white/10 backdrop-blur-md px-3 py-1 rounded-2xl border border-white/5 font-medium flex items-center gap-1.5">
                    <span>🌙</span> {prayerData.date.hijri.day} {prayerData.date.hijri.month.en} {prayerData.date.hijri.year} H
                  </span>
                  <span className="bg-white/10 backdrop-blur-md px-3 py-1 rounded-2xl border border-white/5 font-medium flex items-center gap-1.5">
                    <span>🌾</span> {javDate.hari} {javDate.pasaran}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Modern Card-Based Prayer Schedule */}
        {prayerData && (
          <div className="bg-white/70 backdrop-blur-md p-6 rounded-[2rem] border border-gray-100 shadow-sm space-y-4">
            <div className="flex justify-between items-center px-1">
              <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest">Jadwal Shalat</h3>
              <span className="text-[10px] bg-emerald-50 text-emerald-700 font-bold px-2.5 py-1 rounded-lg">
                Kota Jakarta
              </span>
            </div>

            <div className="grid grid-cols-5 gap-2.5">
              {[
                { label: 'Subuh', key: 'Fajr' },
                { label: 'Dzuhur', key: 'Dhuhr' },
                { label: 'Ashar', key: 'Asr' },
                { label: 'Maghrib', key: 'Maghrib' },
                { label: 'Isya', key: 'Isha' },
              ].map((pr) => {
                const isCurrent = currentPrayer === pr.label
                return (
                  <div
                    key={pr.key}
                    className={`p-3 rounded-2xl transition-all duration-300 transform active:scale-95 ${
                      isCurrent 
                        ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/10 scale-105 border border-emerald-500' 
                        : 'bg-gray-50/50 hover:bg-gray-50 border border-gray-100/50'
                    }`}
                  >
                    <p className={`text-[10px] font-bold ${isCurrent ? 'text-emerald-100' : 'text-gray-400'}`}>
                      {pr.label}
                    </p>
                    <p className="text-xs font-black tracking-tight mt-1.5">
                      {prayerData.timings[pr.key as keyof typeof prayerData.timings]?.split(' ')[0] || '--:--'}
                    </p>
                    {isCurrent && (
                      <span className="block w-1.5 h-1.5 bg-white rounded-full mx-auto mt-2 animate-ping" />
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>

      {/* Right side: Choghadiya */}
      <div className="md:col-span-1">
        {choghadiya && (
          <div className="bg-white/70 backdrop-blur-md p-6 rounded-[2rem] border border-gray-100 shadow-sm space-y-5 h-full flex flex-col justify-between">
            <div>
              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 px-1">
                <div>
                  <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest">Waktu Fokus</h3>
                  <p className="text-[10px] text-gray-400 mt-1">Siklus Choghadiya harian</p>
                </div>
                
                {/* Minimalist Tab Toggle */}
                <div className="bg-gray-100/80 p-1 rounded-xl flex self-start">
                  <button
                    onClick={() => setActiveSegment('day')}
                    className={`text-[10px] font-bold px-3 py-1.5 rounded-lg transition-all ${
                      activeSegment === 'day' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-900'
                    }`}
                  >
                    ☀️ Siang
                  </button>
                  <button
                    onClick={() => setActiveSegment('night')}
                    className={`text-[10px] font-bold px-3 py-1.5 rounded-lg transition-all ${
                      activeSegment === 'night' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-900'
                    }`}
                  >
                    🌙 Malam
                  </button>
                </div>
              </div>
              
              <div className="space-y-2.5 mt-4 max-h-[30rem] overflow-y-auto pr-1">
                {(activeSegment === 'day' ? choghadiya.day : choghadiya.night).map((p, idx) => {
                  const colors = cardColors[p.quality]
                  return (
                    <div
                      key={idx}
                      className={`p-3.5 ${colors.bg} rounded-2xl border border-gray-100/30 flex justify-between items-center text-xs transition-all duration-300 transform hover:-translate-y-0.5 active:scale-[0.99]`}
                    >
                      <div className="flex items-center space-x-3">
                        <span className={`w-2 h-2 rounded-full ${colors.dot}`} />
                        <div>
                          <p className={`font-bold ${colors.text}`}>{p.label.split(' (')[0]}</p>
                          <p className="text-[10px] text-gray-400 mt-0.5">{p.label.includes('(') ? p.label.split('(')[1].replace(')', '') : 'Rutinitas'}</p>
                        </div>
                      </div>
                      <p className="font-bold text-gray-700 bg-white/80 backdrop-blur px-2.5 py-1 rounded-xl border border-gray-100 text-[10px] tracking-tight">
                        {p.start} - {p.end}
                      </p>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
