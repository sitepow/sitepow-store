'use client'

import { useRef, useState } from 'react'
import type { PropsWithChildren } from 'react'
import toast from 'react-hot-toast'

import { useLocale } from 'next-intl'

import { QUERY_RETRY_COUNT, QUERY_TIMES } from '@/constants/query'
import {
  SERVER_ERROR_MESSAGE_EN,
  SERVER_ERROR_MESSAGE_TH,
} from '@/constants/system'
import {
  MutationCache,
  QueryCache,
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'

const QueryProviders = ({ children }: PropsWithChildren) => {
  const locale = useLocale()
  const localeRef = useRef(locale)
  localeRef.current = locale

  const [queryClient] = useState(
    () =>
      new QueryClient({
        queryCache: new QueryCache({
          onError: () => {
            const isEn = localeRef.current === 'en'
            toast.error(
              isEn ? SERVER_ERROR_MESSAGE_EN : SERVER_ERROR_MESSAGE_TH,
            )
          },
        }),
        mutationCache: new MutationCache({
          onError: () => {
            const isEn = localeRef.current === 'en'
            toast.error(
              isEn ? SERVER_ERROR_MESSAGE_EN : SERVER_ERROR_MESSAGE_TH,
            )
          },
          onSuccess: (result: unknown) => {
            const isResponse = (
              res: unknown,
            ): res is {
              success: boolean
              messageTH?: string
              messageEN?: string
              message?: string
            } => {
              return (
                typeof res === 'object' &&
                res !== null &&
                'success' in res &&
                ('messageTH' in res || 'messageEN' in res || 'message' in res)
              )
            }

            if (isResponse(result)) {
              const isEn = localeRef.current === 'en'
              const message = isEn
                ? result.messageEN || result.messageTH || result.message
                : result.messageTH || result.messageEN || result.message

              if (result.success) {
                if (message) {
                  toast.success(message)
                }
              } else {
                if (!message) {
                  toast.error(
                    isEn ? SERVER_ERROR_MESSAGE_EN : SERVER_ERROR_MESSAGE_TH,
                  )
                } else {
                  toast.error(message)
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
