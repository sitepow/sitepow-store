const THAILAND_TZ = 'Asia/Bangkok'

/**
 * แปลงวันที่เป็นรูปแบบภาษาไทยเต็ม (เช่น 24 สิงหาคม 2026)
 */
export const formatDate = (date: Date | string | number): string => {
  return new Intl.DateTimeFormat('th-TH', {
    timeZone: THAILAND_TZ,
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(date))
}

/**
 * แปลงวันที่และเวลา UTC เป็นเวลาไทย YYYY-MM-DD HH:mm
 */
export const formatDateTime = (date: Date | string | number): string => {
  const d = new Date(date)

  // ใช้ sv-SE เพื่อดึง Format ISO (YYYY-MM-DD HH:mm) ตาม Timezone ไทย
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

/**
 * แปลงวันที่เป็นรูปแบบภาษาไทยย่อ (เช่น 24 ส.ค. 2026)
 */
export const formatShortDate = (date: Date | string | number): string => {
  return new Intl.DateTimeFormat('th-TH', {
    timeZone: THAILAND_TZ,
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(date))
}

/**
 * แปลงเวลา UTC เป็นเวลาไทย HH:mm:ss
 */
export const formatShortTime = (date: Date | string | number): string => {
  return new Intl.DateTimeFormat('th-TH', {
    timeZone: THAILAND_TZ,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).format(new Date(date))
}

/**
 * ข้อความแจ้งเตือนการระงับบัญชี (คำนวณตามเวลาไทย)
 */
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

/**
 * ผสานวันที่ระบุ เข้ากับ "เวลาปัจจุบันของประเทศไทย"
 */
export function parseExpenseDateWithCurrentTime(
  inputDate: string | Date,
): Date {
  const targetDate = new Date(inputDate)
  const now = new Date()

  // ดึงเวลาปัจจุบันตาม Timezone ไทย
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: THAILAND_TZ,
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
    hour12: false,
  })

  const parts = formatter.formatToParts(now)
  const hours = parseInt(parts.find((p) => p.type === 'hour')?.value || '0', 10)
  const minutes = parseInt(
    parts.find((p) => p.type === 'minute')?.value || '0',
    10,
  )
  const seconds = parseInt(
    parts.find((p) => p.type === 'second')?.value || '0',
    10,
  )

  targetDate.setHours(hours, minutes, seconds, 0)

  return targetDate
}
