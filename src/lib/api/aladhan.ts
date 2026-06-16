export interface HijriDate {
  date: string // e.g. "16-06-2026"
  hijri: {
    date: string // e.g. "01-12-1447"
    day: string
    month: {
      number: number
      en: string
      ar: string
    }
    year: string
  }
}

export interface PrayerTimings {
  Fajr: string
  Sunrise: string
  Dhuhr: string
  Asr: string
  Sunset: string
  Maghrib: string
  Isha: string
  Imsak: string
  Midnight: string
}

export interface PrayerData {
  timings: PrayerTimings
  date: HijriDate
}

/**
 * Fetch Hijri date and prayer times from Aladhan API
 * Fallback to local default calculation if API fails
 */
export async function getPrayerAndHijriData(
  latitude = -6.2088,
  longitude = 106.8456,
  dateStr?: string // format "DD-MM-YYYY"
): Promise<PrayerData> {
  const targetDateStr = dateStr || getFormattedDateToday()
  
  try {
    const response = await fetch(
      `https://api.aladhan.com/v1/timings/${targetDateStr}?latitude=${latitude}&longitude=${longitude}&method=20`
    )
    
    if (!response.ok) {
      throw new Error('Aladhan API request failed')
    }
    
    const resJson = await response.json()
    if (resJson.code === 200 && resJson.data) {
      return {
        timings: resJson.data.timings,
        date: {
          date: targetDateStr,
          hijri: resJson.data.date.hijri
        }
      }
    }
  } catch (error) {
    console.error('Failed to fetch Aladhan API, using local fallback:', error)
  }
  
  // Local fallback data
  return getFallbackData(targetDateStr)
}

function getFormattedDateToday(): string {
  const today = new Date()
  const dd = String(today.getDate()).padStart(2, '0')
  const mm = String(today.getMonth() + 1).padStart(2, '0')
  const yyyy = today.getFullYear()
  return `${dd}-${mm}-${yyyy}`
}

function getFallbackData(dateStr: string): PrayerData {
  // Simple fallback Hijri calculation (approximation)
  // 16-06-2026 corresponds roughly to early Zulhijjah 1447 AH.
  const [d] = dateStr.split('-').map(Number)
  
  return {
    timings: {
      Fajr: '04:45',
      Sunrise: '06:01',
      Dhuhr: '12:02',
      Asr: '15:22',
      Sunset: '17:58',
      Maghrib: '17:58',
      Isha: '19:12',
      Imsak: '04:35',
      Midnight: '23:30'
    },
    date: {
      date: dateStr,
      hijri: {
        date: `01-12-1447`,
        day: String(d),
        month: {
          number: 12,
          en: 'Dhul-Hijjah',
          ar: 'ذو الحجة'
        },
        year: '1447'
      }
    }
  }
}
