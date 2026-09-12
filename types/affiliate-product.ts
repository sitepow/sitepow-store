export type AffiliatePlatform = 'SHOPEE' | 'LAZADA' | 'TIKTOK' | 'OTHER'

export interface AffiliateProductLink {
  id: string
  platform: AffiliatePlatform
  url: string
  label?: string
  price?: number
  originalPrice?: number
  isDiscounted?: boolean
  discountText?: string
}

export const AFFILIATE_PLATFORM_CONFIG: Record<
  AffiliatePlatform,
  {
    name: string
    color: string
    bgLight: string
    badgeClass: string
    borderClass: string
  }
> = {
  SHOPEE: {
    name: 'Shopee',
    color: '#EE4D2D',
    bgLight: 'bg-[#EE4D2D]/10 text-[#EE4D2D]',
    badgeClass: 'bg-[#EE4D2D] text-white',
    borderClass: 'border-[#EE4D2D]/30 hover:border-[#EE4D2D]',
  },
  LAZADA: {
    name: 'Lazada',
    color: '#0F146D',
    bgLight:
      'bg-[#0F146D]/10 text-[#0F146D] dark:bg-[#0F146D]/20 dark:text-blue-400',
    badgeClass: 'bg-[#0F146D] text-white',
    borderClass: 'border-[#0F146D]/30 hover:border-[#0F146D]',
  },
  TIKTOK: {
    name: 'TikTok Shop',
    color: '#000000',
    bgLight: 'bg-black/10 text-black dark:bg-white/10 dark:text-white',
    badgeClass: 'bg-black text-white dark:bg-white dark:text-black',
    borderClass:
      'border-black/30 dark:border-white/30 hover:border-black dark:hover:border-white',
  },
  OTHER: {
    name: 'Other / ร้านค้า',
    color: '#4F46E5',
    bgLight: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400',
    badgeClass: 'bg-indigo-600 text-white',
    borderClass: 'border-indigo-500/30 hover:border-indigo-500',
  },
}

export function detectAffiliatePlatform(url: string): AffiliatePlatform {
  try {
    const parsed = new URL(url)
    const host = parsed.hostname.toLowerCase()
    if (host.includes('shopee') || host.includes('shp.ee')) return 'SHOPEE'
    if (host.includes('lazada')) return 'LAZADA'
    if (host.includes('tiktok')) return 'TIKTOK'
    return 'OTHER'
  } catch {
    const lower = url.toLowerCase()
    if (lower.includes('shopee') || lower.includes('shp.ee')) return 'SHOPEE'
    if (lower.includes('lazada')) return 'LAZADA'
    if (lower.includes('tiktok')) return 'TIKTOK'
    return 'OTHER'
  }
}

export interface ParsedMarketplaceInput {
  url?: string
  title?: string
  price?: number
  discountText?: string
  platform: AffiliatePlatform
}

export function parseMarketplaceInput(rawText: string): ParsedMarketplaceInput {
  const text = rawText.trim()
  const urlMatch = text.match(/https?:\/\/[^\s"'<>]+/i)
  const url = urlMatch ? urlMatch[0] : undefined
  let cleanedText = url ? text.replace(url, '').trim() : text

  const platform = detectAffiliatePlatform(url || text)

  let price: number | undefined
  const priceMatch =
    cleanedText.match(
      /(?:฿|ราคา\s*[:\s]*|THB\s*)\s*([0-9,]+(?:\.[0-9]{1,2})?)/i,
    ) || cleanedText.match(/([0-9,]+(?:\.[0-9]{1,2})?)\s*(?:บาท|.-)/i)
  if (priceMatch && priceMatch[1]) {
    const p = parseFloat(priceMatch[1].replace(/,/g, ''))
    if (!isNaN(p) && p > 0) price = p
  }

  let discountText: string | undefined
  const discountMatch = cleanedText.match(
    /\[?\s*(?:ลด|ส่วนลด)\s*([0-9]+%)\s*\]?/i,
  )
  if (discountMatch) {
    discountText = `ลด ${discountMatch[1]}`
  }

  let titleFromUrl: string | undefined
  if (url) {
    try {
      const parsed = new URL(url)
      const pathname = decodeURIComponent(parsed.pathname)
      const shopeeSlugMatch = pathname.match(/\/([^\/]+)-i\.\d+\.\d+/)
      if (shopeeSlugMatch && shopeeSlugMatch[1]) {
        titleFromUrl = shopeeSlugMatch[1].replace(/-/g, ' ').trim()
      }
      const lazadaSlugMatch = pathname.match(/\/products\/([^\/]+)-i\d+/)
      if (lazadaSlugMatch && lazadaSlugMatch[1]) {
        titleFromUrl = lazadaSlugMatch[1].replace(/-/g, ' ').trim()
      }
    } catch {}
  }

  let title = titleFromUrl
  cleanedText = cleanedText
    .replace(
      /ซื้อได้ที่\s*(?:Shopee|Lazada|TikTok)\s*(?:ตอนนี้เลย|เลย)!?/gi,
      '',
    )
    .replace(/ดูวิดีโอนี้ใน\s*TikTok/gi, '')
    .replace(/\[\s*ลด\s*[0-9]+%\s*\]/gi, '')
    .replace(
      /(?:ราคา|฿|THB)\s*[:\s]*[0-9,]+(?:\.[0-9]{1,2})?\s*(?:บาท|.-)?/gi,
      '',
    )
    .replace(/[0-9,]+(?:\.[0-9]{1,2})?\s*(?:บาท|.-)/gi, '')
    .replace(/\s*(?:ราคา|฿|THB)\s*$/gi, '')
    .replace(/[|•]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

  if (cleanedText.length > 3) {
    title = cleanedText
  }

  return { url, title, price, discountText, platform }
}
