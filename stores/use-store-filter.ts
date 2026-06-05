import { create } from 'zustand'
import { persist } from 'zustand/middleware'

import { ALL_BRANCHES, useBranchFilter } from './use-branch-filter'

export const ALL_STORES = 'all' as const

interface StoreFilterState {
  selectedStoreId: string
  setSelectedStoreId: (storeId: string) => void
}

export const useStoreFilter = create<StoreFilterState>()(
  persist(
    (set) => ({
      selectedStoreId: ALL_STORES,
      setSelectedStoreId: (storeId) => {
        set({ selectedStoreId: storeId })
        useBranchFilter.getState().setSelectedBranchId(ALL_BRANCHES)
      },
    }),
    {
      name: 'store-filter-storage',
    },
  ),
)
