'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface AlertState {
  dismissedAlerts: Record<string, boolean>
  dismissAlert: (alertId: string) => void
  isDismissed: (alertId: string) => boolean
  resetAlerts: () => void
}

export const useAlertStore = create<AlertState>()(
  persist(
    (set, get) => ({
      dismissedAlerts: {},

      dismissAlert: (alertId: string) =>
        set((state) => ({
          dismissedAlerts: {
            ...state.dismissedAlerts,
            [alertId]: true,
          },
        })),

      isDismissed: (alertId: string) => {
        return !!get().dismissedAlerts[alertId]
      },

      resetAlerts: () => set({ dismissedAlerts: {} }),
    }),
    {
      name: 'alert-storage',
    },
  ),
)
