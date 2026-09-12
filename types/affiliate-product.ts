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
