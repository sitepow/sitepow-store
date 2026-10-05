/**
 * แปลงจำนวนเงินตัวเลขเป็นข้อความภาษาไทย (Thai Baht Text)
 * เช่น 1250.50 => "หนึ่งพันสองร้อยห้าสิบบาทห้าสิบสตางค์"
 * เช่น 1000.00 => "หนึ่งพันบาทถ้วน"
 * เช่น 0.00 => "ศูนย์บาทถ้วน"
 */

const THAI_DIGITS = [
  'ศูนย์',
  'หนึ่ง',
  'สอง',
  'สาม',
  'สี่',
  'ห้า',
  'หก',
  'เจ็ด',
  'แปด',
  'เก้า',
]

const THAI_POSITIONS = ['', 'สิบ', 'ร้อย', 'พัน', 'หมื่น', 'แสน']

function convertGroup(numberStr: string): string {
  let result = ''
  const len = numberStr.length

  for (let i = 0; i < len; i++) {
    const digit = parseInt(numberStr[i], 10)
    const position = len - i - 1

    if (digit === 0) continue

    if (position === 1 && digit === 1) {
      result += 'สิบ'
    } else if (position === 1 && digit === 2) {
      result += 'ยี่สิบ'
    } else if (position === 0 && digit === 1 && len > 1 && parseInt(numberStr[len - 2], 10) !== 0) {
      result += 'เอ็ด'
    } else if (position === 0 && digit === 1 && len > 1 && parseInt(numberStr[len - 2], 10) === 0 && len > 2) {
      result += 'เอ็ด'
    } else {
      result += THAI_DIGITS[digit] + THAI_POSITIONS[position]
    }
  }

  return result
}

function convertIntegerPart(intStr: string): string {
  if (intStr === '0' || intStr === '') return ''

  // Split into 6-digit groups from right to left
  const groups: string[] = []
  let remaining = intStr

  while (remaining.length > 0) {
    if (remaining.length <= 6) {
      groups.unshift(remaining)
      remaining = ''
    } else {
      groups.unshift(remaining.slice(-6))
      remaining = remaining.slice(0, -6)
    }
  }

  let result = ''
  for (let i = 0; i < groups.length; i++) {
    const groupText = convertGroup(groups[i])
    if (groupText) {
      result += groupText
      const millionsCount = groups.length - 1 - i
      if (millionsCount > 0) {
        result += 'ล้าน'.repeat(millionsCount)
      }
    }
  }

  return result
}

export function formatThaiBahtText(amount: number | string | null | undefined): string {
  if (amount === null || amount === undefined || isNaN(Number(amount))) {
    return 'ศูนย์บาทถ้วน'
  }

  const num = Number(amount)
  if (num === 0) return 'ศูนย์บาทถ้วน'

  const isNegative = num < 0
  const absNum = Math.abs(num)

  // Format to 2 decimal places fixed
  const formatted = absNum.toFixed(2)
  const [intPart, decPart] = formatted.split('.')

  const intText = convertIntegerPart(intPart)
  const satangNum = parseInt(decPart, 10)

  let result = ''
  if (isNegative) {
    result += 'ลบ'
  }

  if (intText) {
    result += intText + 'บาท'
  } else if (satangNum > 0) {
    // ไม่มีจำนวนบาท มีแต่สตางค์
    result += 'ศูนย์บาท'
  }

  if (satangNum === 0) {
    result += 'ถ้วน'
  } else {
    result += convertGroup(decPart) + 'สตางค์'
  }

  return result
}
