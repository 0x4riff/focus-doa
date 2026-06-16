/**
 * Choghadiya (Jam Planet) Calculator
 * Divided into Day Choghadiya (Sunrise to Sunset) and Night Choghadiya (Sunset to Sunrise next day)
 * Each duration is split into 8 equal parts (approx 1.5 hours each).
 *
 * Choghadiya types & focus framing:
 * - Amrit (Nectar): Sangat Baik (Fokus tinggi, ibadah, belajar)
 * - Shubh (Auspicious): Baik (Kerja produktif, kolaborasi)
 * - Labh (Gain): Menguntungkan (Bisnis, negosiasi, planning)
 * - Char (Constant): Netral (Rutinitas, administrasi)
 * - Rog (Disease): Buruk / Istirahat (Hindari kerja berat, gunakan untuk istirahat/kesehatan)
 * - Kaal (Loss): Buruk / Evaluasi (Gunakan untuk berbenah, review, mitigasi risiko)
 * - Udveg (Anxiety): Kurang Baik / Refleksi (Gunakan untuk muhasabah, meditasi, doa)
 */

export interface ChoghadiyaPeriod {
  name: string
  quality: 'excellent' | 'good' | 'beneficial' | 'neutral' | 'rest' | 'review' | 'reflect'
  start: string
  end: string
  label: string
}

// Order of Day Choghadiya depending on day of week (0 = Sunday, 1 = Monday, etc.)
// Days: Sunday (0), Monday (1), Tuesday (2), Wednesday (3), Thursday (4), Friday (5), Saturday (6)
const DAY_ORDER: Record<number, string[]> = {
  0: ['Udveg', 'Amrit', 'Rog', 'Shubh', 'Char', 'Kaal', 'Labh', 'Udveg'], // Sun
  1: ['Amrit', 'Kaal', 'Shubh', 'Char', 'Rog', 'Labh', 'Udveg', 'Amrit'], // Mon
  2: ['Rog', 'Shubh', 'Char', 'Kaal', 'Labh', 'Udveg', 'Amrit', 'Rog'],   // Tue
  3: ['Labh', 'Udveg', 'Amrit', 'Rog', 'Shubh', 'Char', 'Kaal', 'Labh'],   // Wed
  4: ['Shubh', 'Char', 'Kaal', 'Labh', 'Udveg', 'Amrit', 'Rog', 'Shubh'], // Thu
  5: ['Char', 'Kaal', 'Labh', 'Udveg', 'Amrit', 'Rog', 'Shubh', 'Char'], // Fri
  6: ['Kaal', 'Labh', 'Udveg', 'Amrit', 'Rog', 'Shubh', 'Char', 'Kaal'],   // Sat
}

// Order of Night Choghadiya
const NIGHT_ORDER: Record<number, string[]> = {
  0: ['Shubh', 'Amrit', 'Char', 'Rog', 'Kaal', 'Labh', 'Udveg', 'Shubh'], // Sun night
  1: ['Char', 'Rog', 'Kaal', 'Labh', 'Udveg', 'Amrit', 'Rog', 'Char'],   // Mon night
  2: ['Kaal', 'Labh', 'Udveg', 'Amrit', 'Rog', 'Shubh', 'Char', 'Kaal'],   // Tue night
  3: ['Udveg', 'Amrit', 'Rog', 'Shubh', 'Char', 'Kaal', 'Labh', 'Udveg'], // Wed night
  4: ['Amrit', 'Kaal', 'Shubh', 'Char', 'Rog', 'Labh', 'Udveg', 'Amrit'], // Thu night
  5: ['Rog', 'Shubh', 'Char', 'Kaal', 'Labh', 'Udveg', 'Amrit', 'Rog'],   // Fri night
  6: ['Labh', 'Udveg', 'Amrit', 'Rog', 'Shubh', 'Char', 'Kaal', 'Labh'],   // Sat night
}

const METADATA: Record<string, { label: string; quality: ChoghadiyaPeriod['quality'] }> = {
  Amrit: { label: 'Amrit (Sangat Baik - Fokus & Ibadah)', quality: 'excellent' },
  Shubh: { label: 'Shubh (Baik - Kerja & Kolaborasi)', quality: 'good' },
  Labh: { label: 'Labh (Menguntungkan - Planning & Bisnis)', quality: 'beneficial' },
  Char: { label: 'Char (Netral - Rutinitas)', quality: 'neutral' },
  Rog: { label: 'Rog (Istirahat & Pemulihan)', quality: 'rest' },
  Kaal: { label: 'Kaal (Evaluasi & Review)', quality: 'review' },
  Udveg: { label: 'Udveg (Muhasabah & Refleksi)', quality: 'reflect' },
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
}

/**
 * Calculates Choghadiya periods for a given day, sunrise and sunset times.
 * Default sunrise/sunset fallback if API not loaded: 06:00 and 18:00.
 */
export function calculateChoghadiya(
  date: Date,
  sunriseStr = '06:00',
  sunsetStr = '18:00'
): { day: ChoghadiyaPeriod[]; night: ChoghadiyaPeriod[] } {
  const dayIndex = date.getDay()
  
  // Parse sunrise & sunset times
  const [riseH, riseM] = sunriseStr.split(':').map(Number)
  const [setH, setM] = sunsetStr.split(':').map(Number)
  
  const baseDate = new Date(date)
  baseDate.setHours(0, 0, 0, 0)
  
  const sunrise = new Date(baseDate)
  sunrise.setHours(riseH, riseM, 0, 0)
  
  const sunset = new Date(baseDate)
  sunset.setHours(setH, setM, 0, 0)
  
  const nextDaySunrise = new Date(sunrise)
  nextDaySunrise.setDate(nextDaySunrise.getDate() + 1)
  
  // Day duration & interval
  const dayDurationMs = sunset.getTime() - sunrise.getTime()
  const dayIntervalMs = dayDurationMs / 8
  
  // Night duration & interval
  const nightDurationMs = nextDaySunrise.getTime() - sunset.getTime()
  const nightIntervalMs = nightDurationMs / 8
  
  const dayPeriods: ChoghadiyaPeriod[] = []
  const nightPeriods: ChoghadiyaPeriod[] = []
  
  const dayNames = DAY_ORDER[dayIndex] || DAY_ORDER[0]
  const nightNames = NIGHT_ORDER[dayIndex] || NIGHT_ORDER[0]
  
  // Calculate Day periods
  for (let i = 0; i < 8; i++) {
    const start = new Date(sunrise.getTime() + i * dayIntervalMs)
    const end = new Date(sunrise.getTime() + (i + 1) * dayIntervalMs)
    const name = dayNames[i]
    dayPeriods.push({
      name,
      start: formatTime(start),
      end: formatTime(end),
      label: METADATA[name].label,
      quality: METADATA[name].quality,
    })
  }
  
  // Calculate Night periods
  for (let i = 0; i < 8; i++) {
    const start = new Date(sunset.getTime() + i * nightIntervalMs)
    const end = new Date(sunset.getTime() + (i + 1) * nightIntervalMs)
    const name = nightNames[i]
    nightPeriods.push({
      name,
      start: formatTime(start),
      end: formatTime(end),
      label: METADATA[name].label,
      quality: METADATA[name].quality,
    })
  }
  
  return { day: dayPeriods, night: nightPeriods }
}
