export const THAILAND_TZ = 'Asia/Bangkok'

export const formatDate = (date: Date | string | number): string => {
  return new Intl.DateTimeFormat('th-TH', {
    timeZone: THAILAND_TZ,
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(date))
}

export const formatDateTime = (date: Date | string | number): string => {
  const d = new Date(date)

  const formatted = new Intl.DateTimeFormat('sv-SE', {
    timeZone: THAILAND_TZ,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(d)

  return formatted.replace(' ', ' ')
}

export const formatShortDate = (date: Date | string | number): string => {
  return new Intl.DateTimeFormat('th-TH', {
    timeZone: THAILAND_TZ,
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(date))
}

export const formatShortTime = (date: Date | string | number): string => {
  return new Intl.DateTimeFormat('th-TH', {
    timeZone: THAILAND_TZ,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).format(new Date(date))
}

export const getBlockMessage = (blockedUntil: Date | string | null): string => {
  if (!blockedUntil) {
    return 'บัญชีของคุณถูกระงับการสั่งซื้อถาวรเนื่องจากพบความผิดปกติ'
  }

  const unlockDate = new Date(blockedUntil)
  const now = new Date()
  const diffMs = unlockDate.getTime() - now.getTime()

  if (diffMs <= 0) {
    return 'บัญชีของคุณพ้นกำหนดระงับแล้ว กรุณาลองใหม่อีกครั้ง'
  }

  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  const diffHours = Math.floor(
    (diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
  )
  const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))

  const unlockDateStr = new Intl.DateTimeFormat('th-TH', {
    timeZone: THAILAND_TZ,
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(unlockDate)

  const unlockTimeStr = new Intl.DateTimeFormat('th-TH', {
    timeZone: THAILAND_TZ,
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(unlockDate)

  let remainingTimeStr = ''
  if (diffDays > 0) {
    remainingTimeStr = `อีกประมาณ ${diffDays} วัน ${diffHours} ชั่วโมง`
  } else if (diffHours > 0) {
    remainingTimeStr = `อีกประมาณ ${diffHours} ชั่วโมง ${diffMinutes} นาที`
  } else {
    remainingTimeStr = `อีกประมาณ ${diffMinutes} นาที`
  }

  return `บัญชีของคุณถูกระงับการสั่งซื้อชั่วคราว ระบบจะปลดล็อกอัตโนมัติในวันที่ ${unlockDateStr} เวลา ${unlockTimeStr} น. (${remainingTimeStr})`
}

export function getThaiDateParts(date: Date) {
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: THAILAND_TZ,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    weekday: 'short',
    hour: 'numeric',
    hour12: false,
  })

  const parts = Object.fromEntries(
    formatter.formatToParts(date).map((p) => [p.type, p.value]),
  )

  const weekdayMap: Record<string, number> = {
    Sun: 0,
    Mon: 1,
    Tue: 2,
    Wed: 3,
    Thu: 4,
    Fri: 5,
    Sat: 6,
  }

  return {
    year: parts.year,
    month: parts.month,
    day: parts.day,
    dayOfWeek: weekdayMap[parts.weekday] ?? 0,
    hour: parseInt(parts.hour === '24' ? '0' : parts.hour, 10),
  }
}

export function buildExpenseDateWithServerTime(inputDate: string | Date): Date {
  let targetDate: Date
  if (typeof inputDate === 'string' && inputDate.includes('-')) {
    const [year, month, day] = inputDate.split('T')[0].split('-').map(Number)
    targetDate = new Date(year, month - 1, day)
  } else {
    targetDate = new Date(inputDate)
  }

  const now = new Date()

  targetDate.setHours(
    now.getHours(),
    now.getMinutes(),
    now.getSeconds(),
    now.getMilliseconds(),
  )

  return targetDate
}

export function getThaiBoundary(
  year: number,
  month: number,
  day: number,
  hours = 0,
  minutes = 0,
  seconds = 0,
  ms = 0,
): Date {
  return new Date(Date.UTC(year, month, day, hours - 7, minutes, seconds, ms))
}
