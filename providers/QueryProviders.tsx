'use client'

import { useState } from 'react'
import type { PropsWithChildren } from 'react'
import toast from 'react-hot-toast'

import { QUERY_RETRY_COUNT, QUERY_TIMES } from '@/constants/query'
import { SERVER_ERROR_MESSAGE } from '@/constants/system'
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
          onError: () => {
            toast.error(SERVER_ERROR_MESSAGE)
          },
        }),
        mutationCache: new MutationCache({
          onError: () => {
            toast.error(SERVER_ERROR_MESSAGE)
          },
          onSuccess: (result: unknown) => {
            const isResponse = (
              res: unknown,
            ): res is { success: boolean; message: string } => {
              return (
                typeof res === 'object' &&
                res !== null &&
                'success' in res &&
                'message' in res
              )
            }

            if (isResponse(result)) {
              if (result.success) {
                toast.success(result.message)
              } else {
                if (!result.message) {
                  toast.error(SERVER_ERROR_MESSAGE)
                } else {
                  toast.error(result.message)
                }
              }
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
