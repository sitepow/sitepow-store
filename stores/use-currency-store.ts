'use client'

import { ALL_CURRENCIES, CURRENCY_CONFIG, convertCurrency } from '@/constants/currencies'
import { CurrencyCode } from '@/generated/prisma/enums'
import { create } from 'zustand'

interface CurrencyStoreState {
  currency: CurrencyCode
  setCurrency: (currency: CurrencyCode) => void
}

function getInitialCurrency(): CurrencyCode {
  if (typeof document !== 'undefined') {
    const match = document.cookie.match(/(?:^|;\s*)NEXT_CURRENCY=([^;]+)/)
    if (match && match[1]) {
      const val = match[1].toUpperCase() as CurrencyCode
      if (CURRENCY_CONFIG[val]) {
        return val
      }
    }
  }
  return CurrencyCode.THB
}

export const useCurrencyStore = create<CurrencyStoreState>((set) => ({
  currency: typeof window !== 'undefined' ? getInitialCurrency() : CurrencyCode.THB,
  setCurrency: (currency: CurrencyCode) => {
    if (typeof document !== 'undefined') {
      document.cookie = `NEXT_CURRENCY=${currency}; path=/; max-age=31536000; SameSite=Lax`
    }
    set({ currency })
  },
}))

/**
 * Hook to convert and format prices relative to store's base currency
 */
export function useStorefrontCurrency(baseCurrency: CurrencyCode = CurrencyCode.THB) {
  const currentCurrency = useCurrencyStore((state) => state.currency)

  const convert = (amount: number) => {
    return convertCurrency(amount, baseCurrency, currentCurrency)
  }

  return {
    currentCurrency,
    baseCurrency,
    convert,
    currencyInfo: CURRENCY_CONFIG[currentCurrency] || CURRENCY_CONFIG[CurrencyCode.THB],
  }
}

