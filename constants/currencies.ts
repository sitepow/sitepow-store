import { CurrencyCode } from '@/generated/prisma/enums'

export interface CurrencyInfo {
  code: CurrencyCode
  name: string
  nameTH: string
  symbol: string
  flag: string
  rateAgainstUSD: number // 1 USD = X Currency
  isZeroDecimal?: boolean
}

// Benchmark baseline exchange rates (1 USD = X Currency)
export const CURRENCY_CONFIG: Record<CurrencyCode, CurrencyInfo> = {
  [CurrencyCode.USD]: {
    code: CurrencyCode.USD,
    name: 'US Dollar',
    nameTH: 'ดอลลาร์สหรัฐ',
    symbol: '$',
    flag: '🇺🇸',
    rateAgainstUSD: 1.0,
  },
  [CurrencyCode.THB]: {
    code: CurrencyCode.THB,
    name: 'Thai Baht',
    nameTH: 'บาทไทย',
    symbol: '฿',
    flag: '🇹🇭',
    rateAgainstUSD: 35.5,
  },
  [CurrencyCode.EUR]: {
    code: CurrencyCode.EUR,
    name: 'Euro',
    nameTH: 'ยูโร',
    symbol: '€',
    flag: '🇪🇺',
    rateAgainstUSD: 0.92,
  },
  [CurrencyCode.JPY]: {
    code: CurrencyCode.JPY,
    name: 'Japanese Yen',
    nameTH: 'เยนญี่ปุ่น',
    symbol: '¥',
    flag: '🇯🇵',
    rateAgainstUSD: 155.0,
    isZeroDecimal: true,
  },
  [CurrencyCode.GBP]: {
    code: CurrencyCode.GBP,
    name: 'British Pound',
    nameTH: 'ปอนด์สเตอร์ลิง',
    symbol: '£',
    flag: '🇬🇧',
    rateAgainstUSD: 0.79,
  },
  [CurrencyCode.AUD]: {
    code: CurrencyCode.AUD,
    name: 'Australian Dollar',
    nameTH: 'ดอลลาร์ออสเตรเลีย',
    symbol: 'A$',
    flag: '🇦🇺',
    rateAgainstUSD: 1.52,
  },
  [CurrencyCode.CAD]: {
    code: CurrencyCode.CAD,
    name: 'Canadian Dollar',
    nameTH: 'ดอลลาร์แคนาดา',
    symbol: 'CA$',
    flag: '🇨🇦',
    rateAgainstUSD: 1.36,
  },
  [CurrencyCode.CHF]: {
    code: CurrencyCode.CHF,
    name: 'Swiss Franc',
    nameTH: 'ฟรังก์สวิส',
    symbol: 'CHF',
    flag: '🇨🇭',
    rateAgainstUSD: 0.9,
  },
  [CurrencyCode.CNY]: {
    code: CurrencyCode.CNY,
    name: 'Chinese Yuan',
    nameTH: 'หยวนจีน',
    symbol: '¥',
    flag: '🇨🇳',
    rateAgainstUSD: 7.23,
  },
  [CurrencyCode.HKD]: {
    code: CurrencyCode.HKD,
    name: 'Hong Kong Dollar',
    nameTH: 'ดอลลาร์ฮ่องกง',
    symbol: 'HK$',
    flag: '🇭🇰',
    rateAgainstUSD: 7.82,
  },
  [CurrencyCode.SGD]: {
    code: CurrencyCode.SGD,
    name: 'Singapore Dollar',
    nameTH: 'ดอลลาร์สิงคโปร์',
    symbol: 'S$',
    flag: '🇸🇬',
    rateAgainstUSD: 1.35,
  },
  [CurrencyCode.KRW]: {
    code: CurrencyCode.KRW,
    name: 'South Korean Won',
    nameTH: 'วอนเกาหลีใต้',
    symbol: '₩',
    flag: '🇰🇷',
    rateAgainstUSD: 1370.0,
    isZeroDecimal: true,
  },
  [CurrencyCode.TWD]: {
    code: CurrencyCode.TWD,
    name: 'New Taiwan Dollar',
    nameTH: 'ดอลลาร์ไต้หวัน',
    symbol: 'NT$',
    flag: '🇹🇼',
    rateAgainstUSD: 32.4,
  },
  [CurrencyCode.INR]: {
    code: CurrencyCode.INR,
    name: 'Indian Rupee',
    nameTH: 'รูปีอินเดีย',
    symbol: '₹',
    flag: '🇮🇳',
    rateAgainstUSD: 83.5,
  },
  [CurrencyCode.IDR]: {
    code: CurrencyCode.IDR,
    name: 'Indonesian Rupiah',
    nameTH: 'รูเปียห์อินโดนีเซีย',
    symbol: 'Rp',
    flag: '🇮🇩',
    rateAgainstUSD: 16100.0,
  },
  [CurrencyCode.MYR]: {
    code: CurrencyCode.MYR,
    name: 'Malaysian Ringgit',
    nameTH: 'ริงกิตมาเลเซีย',
    symbol: 'RM',
    flag: '🇲🇾',
    rateAgainstUSD: 4.71,
  },
  [CurrencyCode.PHP]: {
    code: CurrencyCode.PHP,
    name: 'Philippine Peso',
    nameTH: 'เปโซฟิลิปปินส์',
    symbol: '₱',
    flag: '🇵🇭',
    rateAgainstUSD: 58.0,
  },
  [CurrencyCode.VND]: {
    code: CurrencyCode.VND,
    name: 'Vietnamese Dong',
    nameTH: 'ดองเวียดนาม',
    symbol: '₫',
    flag: '🇻🇳',
    rateAgainstUSD: 25400.0,
    isZeroDecimal: true,
  },
  [CurrencyCode.MMK]: {
    code: CurrencyCode.MMK,
    name: 'Myanmar Kyat',
    nameTH: 'จัตพม่า',
    symbol: 'K',
    flag: '🇲🇲',
    rateAgainstUSD: 2100.0,
  },
  [CurrencyCode.KHR]: {
    code: CurrencyCode.KHR,
    name: 'Cambodian Riel',
    nameTH: 'เรียลกัมพูชา',
    symbol: '៛',
    flag: '🇰🇭',
    rateAgainstUSD: 4100.0,
  },
  [CurrencyCode.LAK]: {
    code: CurrencyCode.LAK,
    name: 'Lao Kip',
    nameTH: 'กีบลาว',
    symbol: '₭',
    flag: '🇱🇦',
    rateAgainstUSD: 21800.0,
  },
  [CurrencyCode.BND]: {
    code: CurrencyCode.BND,
    name: 'Brunei Dollar',
    nameTH: 'ดอลลาร์บรูไน',
    symbol: 'B$',
    flag: '🇧🇳',
    rateAgainstUSD: 1.35,
  },
  [CurrencyCode.AED]: {
    code: CurrencyCode.AED,
    name: 'UAE Dirham',
    nameTH: 'ดีแรห์มสหรัฐอาหรับเอมิเรตส์',
    symbol: 'AED',
    flag: '🇦🇪',
    rateAgainstUSD: 3.67,
  },
  [CurrencyCode.SAR]: {
    code: CurrencyCode.SAR,
    name: 'Saudi Riyal',
    nameTH: 'ริยาลซาอุดีอาระเบีย',
    symbol: 'SAR',
    flag: '🇸🇦',
    rateAgainstUSD: 3.75,
  },
  [CurrencyCode.NZD]: {
    code: CurrencyCode.NZD,
    name: 'New Zealand Dollar',
    nameTH: 'ดอลลาร์นิวซีแลนด์',
    symbol: 'NZ$',
    flag: '🇳🇿',
    rateAgainstUSD: 1.63,
  },
}

export const ALL_CURRENCIES = Object.values(CURRENCY_CONFIG)

/**
 * Returns the exchange rate from one currency to another: 1 fromCurrency = X toCurrency
 */
export function getExchangeRate(
  fromCurrency: CurrencyCode | string,
  toCurrency: CurrencyCode | string,
): number {
  const fromCode = (fromCurrency?.toUpperCase() as CurrencyCode) || CurrencyCode.THB
  const toCode = (toCurrency?.toUpperCase() as CurrencyCode) || CurrencyCode.THB

  if (fromCode === toCode) return 1

  const fromInfo = CURRENCY_CONFIG[fromCode]
  const toInfo = CURRENCY_CONFIG[toCode]

  if (!fromInfo || !toInfo) return 1

  return toInfo.rateAgainstUSD / fromInfo.rateAgainstUSD
}

/**
 * Converts an amount from one currency to another
 */
export function convertCurrency(
  amount: number,
  fromCurrency: CurrencyCode | string = CurrencyCode.THB,
  toCurrency: CurrencyCode | string = CurrencyCode.THB,
): number {
  if (isNaN(amount) || amount === 0) return 0
  const rate = getExchangeRate(fromCurrency, toCurrency)
  const converted = amount * rate
  const toCode = (toCurrency?.toUpperCase() as CurrencyCode) || CurrencyCode.THB
  const toInfo = CURRENCY_CONFIG[toCode]

  if (toInfo?.isZeroDecimal) {
    return Math.round(converted)
  }

  return Math.round(converted * 100) / 100
}

/**
 * Checks if a currency is zero-decimal in Stripe
 */
export function isZeroDecimalCurrency(currency: string): boolean {
  const code = currency.toUpperCase() as CurrencyCode
  return Boolean(CURRENCY_CONFIG[code]?.isZeroDecimal)
}

