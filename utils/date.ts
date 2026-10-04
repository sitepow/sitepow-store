import { DAY, HOUR, MINUTE, THAILAND_UTC_OFFSET } from '@/constants/system'

export const THAILAND_TZ = 'Asia/Bangkok'

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

export const formatDayMonth = (
  date: DateInput,
  timeZone: string = THAILAND_TZ,
): string => format(date, 'th-TH', { day: 'numeric', month: 'short' }, timeZone)

export const formatMonthYear = (
  date: DateInput,
  timeZone: string = THAILAND_TZ,
): string =>
  format(date, 'th-TH', { month: 'short', year: '2-digit' }, timeZone)

export const fromNow = (ms: number): Date => new Date(Date.now() + ms)

export const ago = (ms: number): Date => new Date(Date.now() - ms)

export const isPast = (date: DateInput): boolean =>
  new Date(date).getTime() < Date.now()

export const getUtcYearMonthDay = (date: DateInput = new Date()) => {
  const d = new Date(date)

  return {
    year: d.getUTCFullYear(),
    month: d.getUTCMonth(),
    day: d.getUTCDate(),
  }
}

export const toMonthKey = (year: number, month: number): string =>
  `${year}-${month}`

export function getRecentMonths(count: number, year: number, month: number) {
  return Array.from({ length: count }, (_, i) => {
    const d = new Date(Date.UTC(year, month - (count - 1 - i), 1))
    const y = d.getUTCFullYear()
    const m = d.getUTCMonth()

    return { year: y, month: m, key: toMonthKey(y, m) }
  })
}

export const getUtcDayRange = (year: number, month: number, day: number) => ({
  start: new Date(Date.UTC(year, month, day)),
  end: new Date(Date.UTC(year, month, day, 23, 59, 59, 999)),
})

export const getUtcMonthRange = (year: number, month: number) => ({
  start: new Date(Date.UTC(year, month, 1)),
  end: new Date(Date.UTC(year, month + 1, 0, 23, 59, 59, 999)),
})

export const getUtcYearRange = (year: number) => ({
  start: new Date(Date.UTC(year, 0, 1)),
  end: new Date(Date.UTC(year, 11, 31, 23, 59, 59, 999)),
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

const toThaiWallClock = (date: DateInput) =>
  new Date(new Date(date).getTime() + THAILAND_UTC_OFFSET)

export function getThaiDateParts(date: DateInput) {
  const d = toThaiWallClock(date)

  return {
    year: d.getUTCFullYear(),
    month: d.getUTCMonth() + 1,
    day: d.getUTCDate(),
    dayOfWeek: d.getUTCDay(),
    hour: d.getUTCHours(),
  }
}

export const getThaiStartOfDay = (date: DateInput): Date => {
  const d = toThaiWallClock(date)

  return new Date(
    Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()) -
      THAILAND_UTC_OFFSET,
  )
}

export const getThaiEndOfDay = (date: DateInput): Date =>
  new Date(getThaiStartOfDay(date).getTime() + DAY - 1)

export const getThaiStartOfMonth = (date: DateInput, monthsToAdd = 0): Date => {
  const d = toThaiWallClock(date)

  return new Date(
    Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + monthsToAdd, 1) -
      THAILAND_UTC_OFFSET,
  )
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
