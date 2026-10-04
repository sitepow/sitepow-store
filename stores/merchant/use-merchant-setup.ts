import { create } from 'zustand'

interface MerchantStoreSetupState {
  hasShipping: boolean
  hasPayment: boolean
  isConfigured: boolean
  setSetupStatus: (status: {
    hasShipping: boolean
    hasPayment: boolean
  }) => void
}

export const useMerchantSetupStore = create<MerchantStoreSetupState>((set) => ({
  hasShipping: true,
  hasPayment: true,
  isConfigured: true,
  setSetupStatus: ({ hasShipping, hasPayment }) =>
    set({
      hasShipping,
      hasPayment,
      isConfigured: hasShipping && hasPayment,
    }),
}))

// Alias for backward compatibility
export const useMerchantStoreSetupStore = useMerchantSetupStore
