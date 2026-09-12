'use client'

import { useEffect, useRef } from 'react'

import { StoreData } from '@/actions/store'
import { useAffiliateTracking } from '@/hooks/use-affiliate-tracking'
import { useStoreData } from '@/stores/sites/use-store-data'

export function StoreInitializer({ store }: { store: StoreData }) {
  useAffiliateTracking()
  const initialized = useRef(false)

  useEffect(() => {
    if (!initialized.current) {
      useStoreData.getState().setStore(store)
      initialized.current = true
    }
  }, [store])

  return null
}
