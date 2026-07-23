'use client'

import { useEffect, useState } from 'react'

import {
  MILLISECONDS_PER_MINUTE,
  ORDER_EXPIRY_MINUTES,
  SECOND,
} from '@/constants/system'

export function useOrderCountdown(
  createdAt: string | Date,
  durationMinutes: number = ORDER_EXPIRY_MINUTES,
) {
  const [timeLeft, setTimeLeft] = useState<string>('00:00')
  const [isExpired, setIsExpired] = useState<boolean>(false)

  useEffect(() => {
    const calculateTimeLeft = () => {
      const createdTime = new Date(createdAt).getTime()
      const expirationTime =
        createdTime + durationMinutes * MILLISECONDS_PER_MINUTE
      const now = new Date().getTime()
      const difference = expirationTime - now

      if (difference <= 0) {
        setTimeLeft('00:00')
        setIsExpired(true)
        return
      }

      const minutes = Math.floor(
        (difference % (60 * MILLISECONDS_PER_MINUTE)) / MILLISECONDS_PER_MINUTE,
      )
      const seconds = Math.floor(
        (difference % MILLISECONDS_PER_MINUTE) / SECOND,
      )

      setTimeLeft(
        `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`,
      )
      setIsExpired(false)
    }

    calculateTimeLeft()
    const timer = setInterval(calculateTimeLeft, SECOND)

    return () => clearInterval(timer)
  }, [createdAt, durationMinutes])

  return { timeLeft, isExpired }
}
