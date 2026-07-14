import { Plan } from '@/generated/prisma/enums'
import {
  queryOptions,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'

import { subscriptionKeys } from '../query-keys/subscription'
import {
  calculateUpgradeCost,
  changePlan,
  getStoreSubscriptions,
  getSubscriptionInvoices,
  initiatePlanUpgrade,
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

export function useInitiatePlanUpgrade() {
  return useMutation({
    mutationFn: async ({
      storeId,
      newPlan,
      billingCycle,
    }: {
      storeId: string
      newPlan: Plan
      billingCycle: string
    }) => await initiatePlanUpgrade(storeId, newPlan, billingCycle),
  })
}

export function useChangePlan() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      storeId,
      plan,
    }: {
      storeId: string
      plan: Plan
      billingCycle?: string
    }) => await changePlan(storeId, plan),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: subscriptionKeys.all })
    },
  })
}

export function useSubscriptionInvoices({
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
      queryKey: subscriptionKeys.invoices(filters),
      queryFn: async () => await getSubscriptionInvoices(filters),
      enabled: !!ownerId,
      placeholderData: (previousData) => previousData,
    }),
  )
}

export function useUpgradeCost({
  storeId,
  newPlan,
  billingCycle,
}: {
  storeId: string
  newPlan: Plan
  billingCycle: string
}) {
  return useQuery(
    queryOptions({
      queryKey: subscriptionKeys.upgradeCost({
        storeId,
        newPlan,
        billingCycle,
      }),
      queryFn: async () =>
        await calculateUpgradeCost(storeId, newPlan, billingCycle),
      enabled: !!storeId && !!newPlan && !!billingCycle,
    }),
  )
}
