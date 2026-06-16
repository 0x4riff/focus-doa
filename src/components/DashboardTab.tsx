'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { getJavaneseDate } from '@/utils/javaneseCalendar'
import { calculateChoghadiya, ChoghadiyaPeriod } from '@/utils/choghadiya'
import { getPrayerAndHijriData, PrayerData } from '@/lib/api/aladhan'
import { getDailyPlans } from '@/lib/db/dailyPlans'
import { getPrayerChecklist, upsertPrayerChecklist, PrayerChecklist } from '@/lib/db/prayerChecklist'

const QUOTES = [
  { text: "Maka sesungguhnya beserta kesulitan ada kemudahan.", source: "QS. Al-Insyirah: 5" },
  { text: "Cukuplah Allah bagi kami, dan Dia adalah sebaik-baik pelindung.", source: "QS. Ali Imran: 173" },
  { text: "Jadikanlah sabar dan shalat sebagai penolongmu.", source: "QS. Al-Baqarah: 45" },
  { text: "Barangsiapa bertakwa kepada Allah niscaya Dia akan membukakan jalan keluar baginya.", source: "QS. At-Talaq: 2" },
  { text: "Dan Rabbmu berfirman: Berdoalah kepada-Ku, niscaya akan Kuperkenankan bagimu.", source: "QS. Ghafir: 60" }
]

export function DashboardTab() {
  const [javDate, setJavDate] = useState<{ hari: string; pasaran: string; weton: string } | null>(null)
  const [choghadiya, setChoghadiya] = useState<{ day: ChoghadiyaPeriod[]; night: ChoghadiyaPeriod[] } | null>(null)
  const [prayerData, setPrayerData] = useState<PrayerData | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeSegment, setActiveSegment] = useState<'day' | 'night'>('day')
  const [currentPrayer, setCurrentPrayer] = useState<string>('')
  
  // New States for Density
  const [plansStats, setPlansStats] = useState({ total: 0, completed: 0 })
  const [prayerChecklist, setPrayerChecklist] = useState<PrayerChecklist | null>(null)
  const [dhikrCount, setDhikrCount] = useState(0)
  const [dhikrText, setDhikrText] = useState('Subhanallah')
  const [dailyQuote, setDailyQuote] = useState({ text: '', source: '' })

  const todayStr = new Date().toISOString().split('T')[0]

  const loadDashboardData = useCallback(async () => {
    setLoading(true)
    const today = new Date()
    
    // 1. Javanese date
    setJavDate(getJavaneseDate(today))
    
    // 2. Prayer times & Hijri
    const prData = await getPrayerAndHijriData(-6.2088, 106.8456)
    setPrayerData(prData)

    // 3. Stats & Checklist
    const plans = await getDailyPlans(todayStr)
    const completedPlans = plans.filter(p => p.status === 'done').length
    setPlansStats({ total: plans.length, completed: completedPlans })

    const checklist = await getPrayerChecklist(todayStr)
    setPrayerChecklist(checklist)

    // 4. Choghadiya
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
    
    // Pick daily quote based on date index
    const dateIndex = today.getDate() % QUOTES.length
    setDailyQuote(QUOTES[dateIndex])

    // Load tasbih count
    const savedCount = localStorage.getItem('dhikr_count')
    const savedText = localStorage.getItem('dhikr_text')
    if (savedCount) setDhikrCount(parseInt(savedCount, 10))
    if (savedText) setDhikrText(savedText)

    setLoading(false)
  }, [todayStr])

  useEffect(() => {
    loadDashboardData()
  }, [loadDashboardData])

  const handleTogglePrayer = async (prayerKey: keyof Omit<PrayerChecklist, 'id' | 'user_id' | 'prayer_date' | 'notes'>) => {
    const nextVal = prayerChecklist ? !prayerChecklist[prayerKey] : true
    const updated = await upsertPrayerChecklist(todayStr, { [prayerKey]: nextVal })
    if (updated) {
      setPrayerChecklist(updated)
    }
  }

  const handleDhikrTap = () => {
    const nextCount = dhikrCount + 1
    setDhikrCount(nextCount)
    localStorage.setItem('dhikr_count', String(nextCount))
  }

  const handleDhikrReset = () => {
    setDhikrCount(0)
    localStorage.setItem('dhikr_count', '0')
  }

  const handleDhikrChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const text = e.target.value
    setDhikrText(text)
    localStorage.setItem('dhikr_text', text)
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

  const prayersList: { label: string; key: keyof Omit<PrayerChecklist, 'id' | 'user_id' | 'prayer_date' | 'notes'>; apiKey: string }[] = [
    { label: 'Subuh', key: 'fajr_done', apiKey: 'Fajr' },
    { label: 'Dzuhur', key: 'dhuhr_done', apiKey: 'Dhuhr' },
    { label: 'Ashar', key: 'asr_done', apiKey: 'Asr' },
    { label: 'Maghrib', key: 'maghrib_done', apiKey: 'Maghrib' },
    { label: 'Isya', key: 'isha_done', apiKey: 'Isha' },
  ]

  const totalPrayersDone = prayersList.filter(p => prayerChecklist?.[p.key]).length

  return (
    <div className="space-y-6 animate-fade-in md:space-y-0 md:grid md:grid-cols-3 md:gap-6">
      {/* Left side: Header, Stats, Prayer, Tasbih */}
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

        {/* Dense Stats Overview */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white/70 backdrop-blur-md p-5 rounded-[2rem] border border-gray-100 shadow-sm flex items-center space-x-3">
            <span className="text-2xl">🎯</span>
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Target Hari Ini</p>
              <p className="text-base font-black text-gray-800 mt-0.5">
                {plansStats.completed} / {plansStats.total} <span className="text-xs text-gray-400 font-normal">Selesai</span>
              </p>
            </div>
          </div>
          <div className="bg-white/70 backdrop-blur-md p-5 rounded-[2rem] border border-gray-100 shadow-sm flex items-center space-x-3">
            <span className="text-2xl">🕌</span>
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Shalat Fardhu</p>
              <p className="text-base font-black text-gray-800 mt-0.5">
                {totalPrayersDone} / 5 <span className="text-xs text-gray-400 font-normal">Waktu</span>
              </p>
            </div>
          </div>
        </div>

        {/* Modern Card-Based Prayer Schedule + Checklist */}
        {prayerData && (
          <div className="bg-white/70 backdrop-blur-md p-6 rounded-[2rem] border border-gray-100 shadow-sm space-y-4">
            <div className="flex justify-between items-center px-1">
              <div>
                <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest">Jadwal & Checklist Shalat</h3>
                <p className="text-[9px] text-gray-400 mt-0.5">Ketuk kolom shalat untuk mencatat ibadah wajibmu</p>
              </div>
              <span className="text-[10px] bg-emerald-50 text-emerald-700 font-bold px-2.5 py-1 rounded-lg">
                Kota Jakarta
              </span>
            </div>

            <div className="grid grid-cols-5 gap-2.5">
              {prayersList.map((pr) => {
                const isCurrent = currentPrayer === pr.label
                const isDone = prayerChecklist ? prayerChecklist[pr.key] : false
                
                return (
                  <button
                    key={pr.key}
                    onClick={() => handleTogglePrayer(pr.key)}
                    className={`p-3 rounded-2xl transition-all duration-300 transform active:scale-95 text-center flex flex-col items-center justify-center relative ${
                      isDone
                        ? 'bg-emerald-50/80 border border-emerald-200 text-emerald-800 shadow-sm shadow-emerald-100/50'
                        : isCurrent
                        ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/10 scale-105 border border-emerald-500'
                        : 'bg-gray-50/50 hover:bg-gray-50 border border-gray-100/50 text-gray-800'
                    }`}
                  >
                    <p className={`text-[10px] font-bold ${isCurrent && !isDone ? 'text-emerald-100' : 'text-gray-400'}`}>
                      {pr.label}
                    </p>
                    <p className="text-xs font-black tracking-tight mt-1.5">
                      {prayerData.timings[pr.apiKey as keyof typeof prayerData.timings]?.split(' ')[0] || '--:--'}
                    </p>
                    <div className="mt-2.5">
                      {isDone ? (
                        <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px] font-bold">✓</span>
                      ) : (
                        <span className={`w-5 h-5 rounded-full border flex items-center justify-center text-[10px] ${isCurrent ? 'border-emerald-400 bg-emerald-700' : 'border-gray-200 bg-white'}`} />
                      )}
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* Digital Interactive Tasbih Counter */}
        <div className="bg-white/70 backdrop-blur-md p-6 rounded-[2rem] border border-gray-100 shadow-sm space-y-4">
          <div className="flex justify-between items-center px-1">
            <div>
              <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest">Tasbih Digital</h3>
              <p className="text-[9px] text-gray-400 mt-0.5">Melacak dzikir harian Anda secara langsung</p>
            </div>
            
            <select
              value={dhikrText}
              onChange={handleDhikrChange}
              className="text-xs bg-gray-50 border border-gray-200 rounded-xl px-2.5 py-1.5 font-semibold text-gray-700 outline-none"
            >
              <option value="Subhanallah">Subhanallah</option>
              <option value="Alhamdulillah">Alhamdulillah</option>
              <option value="Allahu Akbar">Allahu Akbar</option>
              <option value="Astaghfirullah">Astaghfirullah</option>
            </select>
          </div>

          <div className="flex items-center justify-between bg-gray-50/50 p-4 rounded-2xl border border-gray-100/50">
            <div className="space-y-0.5">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Jumlah Dzikir</span>
              <p className="text-2xl font-black text-gray-800 tracking-tight">{dhikrCount}</p>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={handleDhikrReset}
                className="px-3 py-2 text-xs font-semibold bg-gray-200/60 hover:bg-gray-200 text-gray-600 rounded-xl transition"
              >
                Reset
              </button>
              <button
                onClick={handleDhikrTap}
                className="px-5 py-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-sm hover:shadow active:scale-95 transition-all"
              >
                Ketuk (+1)
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Right side: Choghadiya and Daily Quote */}
      <div className="md:col-span-1 space-y-6">
        {/* Choghadiya (Focus Time) */}
        {choghadiya && (
          <div className="bg-white/70 backdrop-blur-md p-6 rounded-[2rem] border border-gray-100 shadow-sm space-y-5">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 px-1">
              <div>
                <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest">Waktu Fokus</h3>
                <p className="text-[10px] text-gray-400 mt-1">Siklus Choghadiya harian</p>
              </div>
              
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
            
            <div className="space-y-2.5 max-h-[22rem] overflow-y-auto pr-1">
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
        )}

        {/* Daily Quote Card */}
        <div className="bg-gradient-to-br from-gray-900 to-gray-800 text-white p-6 rounded-[2rem] border border-gray-800 shadow-xl space-y-4">
          <div className="flex items-center space-x-2">
            <span className="text-base">📖</span>
            <span className="text-[10px] tracking-widest font-black uppercase text-gray-400">Kutipan Hari Ini</span>
          </div>

          <p className="text-sm font-medium leading-relaxed text-gray-100 italic">
            &ldquo;{dailyQuote.text}&rdquo;
          </p>
          
          <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest text-right">
            — {dailyQuote.source}
          </p>
        </div>
      </div>
    </div>
  )
}
