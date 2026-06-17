import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface ChatState {
  isOpen: boolean
  toggleChat: () => void
  setIsOpen: (status: boolean) => void
}

export const useChatStore = create<ChatState>()(
  persist(
    (set) => ({
      isOpen: false,
      toggleChat: () => set((state) => ({ isOpen: !state.isOpen })),
      setIsOpen: (status) => set({ isOpen: status }),
    }),
    {
      name: 'chat-storage',
    },
  ),
)
