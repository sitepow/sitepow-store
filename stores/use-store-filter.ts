import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const ALL_STORES = 'all' as const

interface StoreFilterState {
  selectedStoreId: string
  setSelectedStoreId: (storeId: string) => void
}

export const useStoreFilter = create<StoreFilterState>()(
  persist(
    (set) => ({
      selectedStoreId: ALL_STORES,
      setSelectedStoreId: (storeId) => set({ selectedStoreId: storeId }),
    }),
    {
      name: 'store-filter-storage',
    },
  ),
)
