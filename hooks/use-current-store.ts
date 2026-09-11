'use client'

import React from 'react'

import { useStoreOptions } from '@/actions/hooks/store'
import { useStoreData } from '@/stores/sites/use-store-data'
import { useStoreFilter } from '@/stores/use-store-filter'

export function useCurrentStore() {
  const { store } = useStoreData()
  const { selectedStoreId } = useStoreFilter()
  const { data: storeOptions } = useStoreOptions()

  const currentStore =
    storeOptions?.find((s) => s.id === selectedStoreId) || storeOptions?.[0]

  return {
    store,
    currentStore,
    primaryColor: currentStore?.primaryColor ?? store?.primaryColor,
    style: {
      '--primary': currentStore?.primaryColor ?? store?.primaryColor,
    } as React.CSSProperties,
  }
}
