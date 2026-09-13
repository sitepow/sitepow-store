'use client'

import React from 'react'

import { useStoreOptions } from '@/actions/hooks/store'
import { getStoreFontFamily } from '@/constants/fonts'
import { useStoreData } from '@/stores/sites/use-store-data'
import { useStoreFilter } from '@/stores/use-store-filter'

export function useCurrentStore() {
  const { store } = useStoreData()
  const { selectedStoreId } = useStoreFilter()
  const { data: storeOptions } = useStoreOptions()

  const currentStore =
    storeOptions?.find((s) => s.id === selectedStoreId) || storeOptions?.[0]

  const fontFamily = currentStore?.fontFamily ?? store?.fontFamily ?? 'default'
  const resolvedFont = getStoreFontFamily(fontFamily)

  return {
    store,
    currentStore,
    primaryColor: currentStore?.primaryColor ?? store?.primaryColor,
    fontFamily,
    resolvedFont,
    fontStyle: {
      fontFamily: resolvedFont,
      '--font-sans': resolvedFont,
    } as React.CSSProperties,
    style: {
      '--primary': currentStore?.primaryColor ?? store?.primaryColor,
      '--font-sans': resolvedFont,
      fontFamily: resolvedFont,
    } as React.CSSProperties,
  }
}
