'use client'

import { useCallback, useState } from 'react'

export function useKitchenChime() {
  const [isSoundEnabled, setIsSoundEnabled] = useState(true)

  const toggleSound = useCallback(() => {
    setIsSoundEnabled((prev) => !prev)
  }, [])

  const playChime = useCallback(() => {
    if (!isSoundEnabled) {
      return
    }

    try {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext
      if (!AudioCtx) return
      const ctx = new AudioCtx()

      const osc1 = ctx.createOscillator()
      const gain1 = ctx.createGain()
      osc1.type = 'sine'
      osc1.frequency.setValueAtTime(587.33, ctx.currentTime)
      gain1.gain.setValueAtTime(0.3, ctx.currentTime)
      gain1.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4)
      osc1.connect(gain1)
      gain1.connect(ctx.destination)
      osc1.start()
      osc1.stop(ctx.currentTime + 0.4)

      const osc2 = ctx.createOscillator()
      const gain2 = ctx.createGain()
      osc2.type = 'sine'
      osc2.frequency.setValueAtTime(880, ctx.currentTime + 0.2)
      gain2.gain.setValueAtTime(0.3, ctx.currentTime + 0.2)
      gain2.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.8)
      osc2.connect(gain2)
      gain2.connect(ctx.destination)
      osc2.start(ctx.currentTime + 0.2)
      osc2.stop(ctx.currentTime + 0.8)
    } catch {}
  }, [isSoundEnabled])

  return {
    isSoundEnabled,
    toggleSound,
    playChime,
  }
}
