import { HOUR, MINUTE } from '@/constants/system'

export const QUERY_TIMES = {
  STALE_TIME_MS: 5 * MINUTE,
  GC_TIME_MS: HOUR,
} as const

export const QUERY_RETRY_COUNT = 3
