'use client'

import { useEffect, useRef } from 'react'

import { StoreData } from '@/actions/store'
import { useStoreData } from '@/stores/sites/use-store-data'

export function StoreInitializer({ store }: { store: StoreData }) {
  const initialized = useRef(false)

  useEffect(() => {
    if (!initialized.current) {
      useStoreData.getState().setStore(store)
      initialized.current = true
    }
  }, [store])

  return null
}
