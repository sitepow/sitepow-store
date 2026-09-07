import { PRICING_VALUE } from '@/constants/pricing'
import { create } from 'zustand'

interface PricingState {
  selectedTab: string
  setSelectedTab: (value: string) => void
}
export const usePricingStore = create<PricingState>((set) => ({
  selectedTab: PRICING_VALUE.TWELVE_MONTHS,
  setSelectedTab: (value) => set({ selectedTab: value }),
}))
