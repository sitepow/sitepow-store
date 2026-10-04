import {
  queryOptions,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'

import { storeTransferKeys } from '@/actions/store/ownership-transfer/query-keys'
import {
  cancelTransferRequest,
  createTransferRequest,
  getTransferRequests,
} from '@/actions/store/ownership-transfer/actions'

export function useTransferRequests(storeId: string) {
  return useQuery(
    queryOptions({
      queryKey: storeTransferKeys.list(storeId),
      queryFn: async () => await getTransferRequests(storeId),
      enabled: !!storeId,
    }),
  )
}

export function useCreateTransferRequest() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      storeId,
      fromOwnerId,
      toEmail,
    }: {
      storeId: string
      fromOwnerId: string
      toEmail: string
    }) => await createTransferRequest(storeId, fromOwnerId, toEmail),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: storeTransferKeys.all })
    },
  })
}

export function useCancelTransferRequest() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      requestId,
      ownerId,
    }: {
      requestId: string
      ownerId: string
    }) => await cancelTransferRequest(requestId, ownerId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: storeTransferKeys.all })
    },
  })
}
