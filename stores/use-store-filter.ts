import { create } from 'zustand'

export const ALL_STORES = 'all' as const

interface StoreFilterState {
  selectedStoreId: string
  setSelectedStoreId: (storeId: string) => void
}

export const useStoreFilter = create<StoreFilterState>((set) => ({
  selectedStoreId: ALL_STORES,
  setSelectedStoreId: (storeId) => set({ selectedStoreId: storeId }),
}))
