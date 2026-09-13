'use client'

import { useStoreOptions } from '@/actions/hooks/store'
import { CURRENCY_CONFIG, convertCurrency } from '@/constants/currencies'
import { CurrencyCode } from '@/generated/prisma/enums'
import { useCurrencyStore } from '@/stores/use-currency-store'
import { ALL_STORES, useStoreFilter } from '@/stores/use-store-filter'
import { formatCurrency } from '@/utils/pricing'

export function useMerchantCurrency(explicitStoreId?: string) {
  const { selectedStoreId } = useStoreFilter()
  const targetId = explicitStoreId || selectedStoreId
  const { data: stores = [] } = useStoreOptions()

  const currentStore = stores.find((s) => s.id === targetId)
  const baseCurrency: CurrencyCode =
    (currentStore as any)?.baseCurrency ??
    (stores.length > 0 && selectedStoreId === ALL_STORES
      ? (stores[0] as any)?.baseCurrency
      : CurrencyCode.THB) ??
    CurrencyCode.THB

  const selectedCurrency = useCurrencyStore((state) => state.currency)
  const currency: CurrencyCode = selectedCurrency || baseCurrency

  const currencyInfo =
    CURRENCY_CONFIG[currency] || CURRENCY_CONFIG[CurrencyCode.THB]

  const convert = (amount: number) => {
    return convertCurrency(amount, baseCurrency, currency)
  }

  return {
    baseCurrency,
    selectedCurrency,
    currency,
    currencyInfo,
    convert,
    format: (amount: number, locale?: string) =>
      formatCurrency(convert(amount), currency, locale),
    formatCurrency: (amount: number, locale?: string) =>
      formatCurrency(convert(amount), currency, locale),
    formatRawCurrency: (amount: number, locale?: string) =>
      formatCurrency(amount, currency, locale),
  }
}
