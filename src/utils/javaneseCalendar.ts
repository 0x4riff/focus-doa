/**
 * Helper to calculate Javanese calendar market day (Pasaran)
 * Reference: January 1, 2024 is Monday Pahing.
 * Javanese market days: Legi (0), Pahing (1), Pon (2), Wage (3), Kliwon (4)
 */

export const PASARAN = ['Legi', 'Pahing', 'Pon', 'Wage', 'Kliwon']
export const HARI = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu']

export interface JavaneseDate {
  hari: string
  pasaran: string
  weton: string
}

export function getJavaneseDate(date: Date): JavaneseDate {
  // Reference date: Jan 1, 2024 is Monday Pahing.
  // Monday is index 1 of HARI, Pahing is index 1 of PASARAN.
  const refDate = new Date(2024, 0, 1) // 1 Jan 2024
  refDate.setHours(0, 0, 0, 0)
  
  const targetDate = new Date(date)
  targetDate.setHours(0, 0, 0, 0)
  
  // Calculate difference in days
  const diffTime = targetDate.getTime() - refDate.getTime()
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
  
  // Day of week index
  const dayIndex = targetDate.getDay()
  const hari = HARI[dayIndex]
  
  // Pasaran calculation: Jan 1, 2024 was Pahing (index 1).
  // Formula: (diffDays + 1) % 5. Handles negative diffs correctly in JS.
  let pasaranIndex = (diffDays + 1) % 5
  if (pasaranIndex < 0) {
    pasaranIndex += 5
  }
  const pasaran = PASARAN[pasaranIndex]
  
  return {
    hari,
    pasaran,
    weton: `${hari} ${pasaran}`
  }
}

/**
 * Calculates weton for a specific birthdate string (YYYY-MM-DD)
 */
export function getWeton(birthdateStr: string): string {
  try {
    const parts = birthdateStr.split('-')
    if (parts.length !== 3) return ''
    const year = parseInt(parts[0], 10)
    const month = parseInt(parts[1], 10) - 1
    const day = parseInt(parts[2], 10)
    const birthDate = new Date(year, month, day)
    
    if (isNaN(birthDate.getTime())) return ''
    
    const jav = getJavaneseDate(birthDate)
    return jav.weton
  } catch {
    return ''
  }
}
