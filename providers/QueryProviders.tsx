'use client'

import { useState } from 'react'
import type { PropsWithChildren } from 'react'
import toast from 'react-hot-toast'

import { QUERY_RETRY_COUNT, QUERY_TIMES } from '@/constants/query'
import {
  MutationCache,
  QueryCache,
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'

const QueryProviders = ({ children }: PropsWithChildren) => {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        queryCache: new QueryCache({
          onError: (error) => {
            if (error?.message) {
              toast.error(error?.message)
            }
          },
        }),
        mutationCache: new MutationCache({
          onError: (error) => {
            if (error?.message) {
              toast.error(error?.message)
            }
          },
          onSuccess: (result: unknown) => {
            if (result && typeof result === 'object' && 'message' in result) {
              const response = result as { message: string }
              toast.success(response.message)
            }
          },
        }),
        defaultOptions: {
          queries: {
            staleTime: QUERY_TIMES.STALE_TIME_MS,
            gcTime: QUERY_TIMES.GC_TIME_MS,
            refetchOnWindowFocus: false,
            retry: QUERY_RETRY_COUNT,
          },
        },
      }),
  )

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {process.env.NODE_ENV === 'development' && (
        <ReactQueryDevtools initialIsOpen={false} />
      )}
    </QueryClientProvider>
  )
}

export { QueryProviders }
