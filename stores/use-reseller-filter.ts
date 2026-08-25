import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface ResellerFilterState {
  selectedAgreementId: string
  setSelectedAgreementId: (agreementId: string) => void
}

export const useResellerFilter = create<ResellerFilterState>()(
  persist(
    (set) => ({
      selectedAgreementId: '',
      setSelectedAgreementId: (agreementId) =>
        set({ selectedAgreementId: agreementId }),
    }),
    {
      name: 'reseller-filter-storage',
    },
  ),
)
