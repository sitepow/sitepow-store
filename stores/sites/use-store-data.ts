import { StoreData } from '@/actions/store'
import { create } from 'zustand'

interface StoreState {
  store: StoreData | null
  setStore: (store: StoreData) => void
}

export const useStoreData = create<StoreState>((set) => ({
  store: null,
  setStore: (store) => set({ store }),
}))
