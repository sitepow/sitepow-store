export const formatDate = (date: Date): string => {
  return new Intl.DateTimeFormat('th-TH', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date)
}

export const formatDateTime = (date: Date | string | number): string => {
  const d = new Date(date)

  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  const hours = String(d.getHours()).padStart(2, '0')
  const minutes = String(d.getMinutes()).padStart(2, '0')

  return `${year}-${month}-${day} ${hours}:${minutes}`
}

export const formatShortDate = (date: Date): string => {
  return new Intl.DateTimeFormat('th-TH', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(date)
}

export const getBlockMessage = (blockedUntil: Date | null): string => {
  if (!blockedUntil) {
    return 'บัญชีของคุณถูกระงับการสั่งซื้อถาวรเนื่องจากพบความผิดปกติ'
  }

  const now = new Date()
  const diffMs = blockedUntil.getTime() - now.getTime()

  if (diffMs <= 0) {
    return 'บัญชีของคุณพ้นกำหนดระงับแล้ว กรุณาลองใหม่อีกครั้ง'
  }

  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  const diffHours = Math.floor(
    (diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
  )
  const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))

  const unlockDateStr = blockedUntil.toLocaleDateString('th-TH', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
  const unlockTimeStr = blockedUntil.toLocaleTimeString('th-TH', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })

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
