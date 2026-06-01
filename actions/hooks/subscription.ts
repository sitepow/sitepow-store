import { Plan } from '@/generated/prisma/enums'
import {
  queryOptions,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'

import { subscriptionKeys } from '../query-keys/subscription'
import {
  cancelSubscription,
  changePlan,
  getStoreSubscriptions,
  getTransactions,
} from '../subscription'

export function useStoreSubscriptions(ownerId: string) {
  return useQuery(
    queryOptions({
      queryKey: subscriptionKeys.lists(ownerId),
      queryFn: async () => await getStoreSubscriptions(ownerId),
      enabled: !!ownerId,
    }),
  )
}

export function useCancelSubscription() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (storeId: string) => await cancelSubscription(storeId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: subscriptionKeys.all })
    },
  })
}

export function useChangePlan() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ storeId, plan }: { storeId: string; plan: Plan }) =>
      await changePlan(storeId, plan),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: subscriptionKeys.all })
    },
  })
}

export function useTransactions({
  ownerId,
  storeId,
  page = 1,
  limit = 10,
}: {
  ownerId: string
  storeId?: string
  page?: number
  limit?: number
}) {
  const filters = { ownerId, storeId, page, limit }

  return useQuery(
    queryOptions({
      queryKey: subscriptionKeys.transactions(filters),
      queryFn: async () => await getTransactions(filters),
      enabled: !!ownerId,
      placeholderData: (previousData) => previousData,
    }),
  )
}
