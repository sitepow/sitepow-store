'use client'

import { useEffect } from 'react'

import { orderKeys } from '@/actions/query-keys/order'
import { posProductKeys } from '@/actions/query-keys/pos/product'
import { productKeys } from '@/actions/query-keys/product'
import { storefrontOrderKeys } from '@/actions/query-keys/storefront/order'
import { useQueryClient } from '@tanstack/react-query'

export function useOrderSSE(storeId?: string) {
  const queryClient = useQueryClient()

  useEffect(() => {
    if (!storeId) {
      return
    }

    const eventSource = new EventSource(`/api/orders/${storeId}`)

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)

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
        console.error(err)
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
