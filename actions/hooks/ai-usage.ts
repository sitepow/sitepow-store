'use client'

import {
  type GetAiLogsParams,
  getAiLogs,
  getStoreAiCredits,
} from '@/actions/ai-usage'
import { aiUsageKeys } from '@/actions/query-keys/ai-usage'
import { queryOptions, useQuery } from '@tanstack/react-query'

export function useStoreAiCredits(ownerId: string, storeId?: string) {
  return useQuery(
    queryOptions({
      queryKey: aiUsageKeys.credits(ownerId, storeId),
      queryFn: () => getStoreAiCredits(ownerId, storeId),
      enabled: !!ownerId,
    }),
  )
}

export function useAiLogs({
  ownerId,
  storeId,
  page = 1,
  limit = 10,
}: GetAiLogsParams) {
  const filters = { ownerId, storeId, page, limit }

  return useQuery(
    queryOptions({
      queryKey: aiUsageKeys.logs(filters),
      queryFn: () => getAiLogs(filters),
      enabled: !!ownerId,
      placeholderData: (prev) => prev,
    }),
  )
}
