import { CurrencyCode } from '@/generated/prisma/enums'

export function getQuickCashAmounts(
  payableAmount: number,
  currency: CurrencyCode,
): number[] {
  let denoms = [10, 20, 50, 100, 500, 1000]
  if (currency === CurrencyCode.THB) {
    denoms = [100, 500, 1000]
  } else if (currency === CurrencyCode.JPY) {
    denoms = [1000, 5000, 10000]
  } else if (currency === CurrencyCode.KRW) {
    denoms = [5000, 10000, 50000]
  } else if (currency === CurrencyCode.VND) {
    denoms = [50000, 100000, 500000]
  } else if (
    ['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'NZD', 'SGD', 'CHF'].includes(currency)
  ) {
    denoms = [5, 10, 20, 50, 100]
  }

  const higher = denoms.filter((d) => d > payableAmount)
  if (higher.length >= 3) {
    return higher.slice(0, 3)
  }
  if (higher.length > 0) {
    const last = higher[higher.length - 1]
    const result = [...higher]
    let next = last * 2
    while (result.length < 3) {
      result.push(next)
      next += last
    }
    return result
  }
  const step = denoms[denoms.length - 1]
  const base = Math.ceil(payableAmount / step) * step
  return [base, base + step, base + step * 2]
}

