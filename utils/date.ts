export const THAILAND_TZ = 'Asia/Bangkok'
const THAILAND_UTC_OFFSET_HOURS = 7

type DateInput = Date | string | number

const format = (
  date: DateInput,
  locale: string,
  options: Intl.DateTimeFormatOptions,
  timeZone: string = THAILAND_TZ,
): string =>
  new Intl.DateTimeFormat(locale, { timeZone, ...options }).format(
    new Date(date),
  )

export const formatDate = (date: DateInput): string =>
  format(date, 'th-TH', { day: 'numeric', month: 'long', year: 'numeric' })

export const formatShortDate = (date: DateInput): string =>
  format(date, 'th-TH', { day: 'numeric', month: 'short', year: 'numeric' })

export const formatDateTime = (
  date: DateInput,
  timeZone: string = THAILAND_TZ,
): string =>
  format(
    date,
    'sv-SE',
    {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    },
    timeZone,
  )

export const formatShortTime = (date: DateInput): string =>
  format(date, 'th-TH', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  })

export const getBlockMessage = (blockedUntil: Date | string | null): string => {
  if (!blockedUntil) {
    return 'บัญชีของคุณถูกระงับการสั่งซื้อถาวรเนื่องจากพบความผิดปกติ'
  }

  const unlockDate = new Date(blockedUntil)
  const diffMs = unlockDate.getTime() - Date.now()

  if (diffMs <= 0) {
    return 'บัญชีของคุณพ้นกำหนดระงับแล้ว กรุณาลองใหม่อีกครั้ง'
  }

  const MINUTE = 60 * 1000
  const HOUR = 60 * MINUTE
  const DAY = 24 * HOUR

  const diffDays = Math.floor(diffMs / DAY)
  const diffHours = Math.floor((diffMs % DAY) / HOUR)
  const diffMinutes = Math.floor((diffMs % HOUR) / MINUTE)

  const unlockDateStr = format(unlockDate, 'th-TH', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })

  const unlockTimeStr = format(unlockDate, 'th-TH', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })

  const remainingTimeStr =
    diffDays > 0
      ? `อีกประมาณ ${diffDays} วัน ${diffHours} ชั่วโมง`
      : diffHours > 0
        ? `อีกประมาณ ${diffHours} ชั่วโมง ${diffMinutes} นาที`
        : `อีกประมาณ ${diffMinutes} นาที`

  return `บัญชีของคุณถูกระงับการสั่งซื้อชั่วคราว ระบบจะปลดล็อกอัตโนมัติในวันที่ ${unlockDateStr} เวลา ${unlockTimeStr} น. (${remainingTimeStr})`
}

export function getThaiDateParts(date: Date) {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat('en-US', {
      timeZone: THAILAND_TZ,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      weekday: 'short',
      hour: 'numeric',
      hour12: false,
    })
      .formatToParts(date)
      .map((p) => [p.type, p.value]),
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

export function buildExpenseDateUtc(inputDate: string): Date {
  const [year, month, day] = inputDate.split('T')[0].split('-').map(Number)
  const now = new Date()

  return new Date(
    Date.UTC(
      year,
      month - 1,
      day,
      now.getUTCHours(),
      now.getUTCMinutes(),
      now.getUTCSeconds(),
      now.getUTCMilliseconds(),
    ),
  )
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
  return new Date(
    Date.UTC(
      year,
      month,
      day,
      hours - THAILAND_UTC_OFFSET_HOURS,
      minutes,
      seconds,
      ms,
    ),
  )
}
