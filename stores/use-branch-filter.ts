import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const ALL_BRANCHES = 'all' as const

interface BranchFilterState {
  selectedBranchId: string
  setSelectedBranchId: (branchId: string) => void
}

export const useBranchFilter = create<BranchFilterState>()(
  persist(
    (set) => ({
      selectedBranchId: ALL_BRANCHES,
      setSelectedBranchId: (branchId) => set({ selectedBranchId: branchId }),
    }),
    {
      name: 'branch-filter-storage',
    },
  ),
)
