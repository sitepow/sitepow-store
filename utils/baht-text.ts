export function thaiBahtText(num: number | string | null | undefined): string {
  if (num === null || num === undefined) return 'ศูนย์บาทถ้วน'

  const amount = typeof num === 'string' ? parseFloat(num) : num
  if (isNaN(amount) || amount === 0) return 'ศูนย์บาทถ้วน'

  const isNegative = amount < 0
  const absAmount = Math.abs(amount)

  const [intPartStr, satangPartStr = ''] = absAmount.toFixed(2).split('.')

  const units = ['', 'สิบ', 'ร้อย', 'พัน', 'หมื่น', 'แสน']
  const digits = [
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

  function convertSection(sectionStr: string): string {
    let result = ''
    const len = sectionStr.length

    for (let i = 0; i < len; i++) {
      const digit = parseInt(sectionStr.charAt(i), 10)
      const pos = len - i - 1

      if (digit !== 0) {
        if (pos === 0 && digit === 1 && len > 1) {
          result += 'เอ็ด'
        } else if (pos === 1 && digit === 1) {
          result += ''
        } else if (pos === 1 && digit === 2) {
          result += 'ยี่'
        } else {
          result += digits[digit]
        }
        result += units[pos]
      }
    }

    return result
  }

  function convertIntegerPart(str: string): string {
    if (str === '0' || !str) return 'ศูนย์'

    let result = ''
    let remaining = str

    const sections: string[] = []
    while (remaining.length > 6) {
      sections.unshift(remaining.slice(-6))
      remaining = remaining.slice(0, -6)
    }
    if (remaining.length > 0) {
      sections.unshift(remaining)
    }

    for (let i = 0; i < sections.length; i++) {
      const secText = convertSection(sections[i])
      result += secText
      if (i < sections.length - 1 && secText.length > 0) {
        result += 'ล้าน'
      }
    }

    return result
  }

  const intPart = convertIntegerPart(intPartStr)
  const satangPartNum = parseInt(satangPartStr, 10)

  let text = ''
  if (isNegative) text += 'ลบ'

  if (satangPartNum === 0) {
    text += `${intPart}บาทถ้วน`
  } else {
    const satangText = convertSection(satangPartStr)
    text += `${intPart === 'ศูนย์' ? '' : `${intPart}บาท`}${satangText}สตางค์`
  }

  return text
}
