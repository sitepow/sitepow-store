'use client'

import { useEffect } from 'react'

import { posProductKeys } from '@/actions/sales/pos-product/query-keys'
import { productKeys } from '@/actions/catalog/product/query-keys'
import { resellerKeys } from '@/actions/reseller/reseller/query-keys'
import { useQueryClient } from '@tanstack/react-query'

import { ResellerEventPayload } from '@/lib/redis/events'

export function useResellerSSE(storeId?: string) {
  const queryClient = useQueryClient()

  useEffect(() => {
    if (!storeId) return

    const eventSource = new EventSource(`/api/sse/reseller/${storeId}`)

    eventSource.onmessage = (event) => {
      try {
        const data: ResellerEventPayload = JSON.parse(event.data)

        const resellerEventTypes: ResellerEventPayload['type'][] = [
          'STOCK_ADDED',
          'STOCK_ACCEPTED',
          'STOCK_UPDATED',
          'PRICE_CHANGED',
          'AGREEMENT_UPDATED',
        ]

        if (resellerEventTypes.includes(data.type)) {
          queryClient.invalidateQueries({ queryKey: resellerKeys.all })
          queryClient.invalidateQueries({ queryKey: posProductKeys.all })
          queryClient.invalidateQueries({ queryKey: productKeys.all })
        }
      } catch (err) {
        console.error('SSE Reseller Error:', err)
      }
    }

    eventSource.onerror = (err) => {
      console.error(err)
      eventSource.close()
    }

    return () => {
      eventSource.close()
    }
  }, [storeId, queryClient])
}
