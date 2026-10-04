'use client'

import { useEffect } from 'react'

import { orderKeys } from '@/actions/sales/order/query-keys'
import { posProductKeys } from '@/actions/sales/pos-product/query-keys'
import { productKeys } from '@/actions/catalog/product/query-keys'
import { storefrontOrderKeys } from '@/actions/storefront/order/query-keys'
import { useQueryClient } from '@tanstack/react-query'

import { OrderEventPayload } from '@/lib/redis/events'

export function useOrderSSE(storeId?: string) {
  const queryClient = useQueryClient()

  useEffect(() => {
    if (!storeId) {
      return
    }

    const eventSource = new EventSource(`/api/sse/order/${storeId}`)

    eventSource.onmessage = (event) => {
      try {
        const data: OrderEventPayload = JSON.parse(event.data)

        if (
          ['ORDER_CREATED', 'ORDER_CANCELLED', 'ORDER_UPDATED'].includes(
            data.type,
          )
        ) {
          queryClient.invalidateQueries({ queryKey: orderKeys.all })
          queryClient.invalidateQueries({ queryKey: storefrontOrderKeys.all })
          queryClient.invalidateQueries({ queryKey: posProductKeys.all })
          queryClient.invalidateQueries({ queryKey: productKeys.all })
        }
      } catch (err) {
        console.error('SSE Order Error:', err)
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
