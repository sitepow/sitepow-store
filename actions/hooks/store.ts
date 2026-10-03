import { Plan, StoreStatus } from '@/generated/prisma/enums'
import { ALL_STORES } from '@/stores/use-store-filter'
import {
  queryOptions,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'

import { storeKeys } from '../query-keys/store'
import {
  CreateStoreInput,
  UpdateStoreInput,
  checkStoreAvailability,
  createStore,
  deleteStore,
  getLandingStores,
  StoreLandingItem,
  getStoreOptions,
  getStoreSetupStatus,
  getStores,
  updateStore,
} from '../store'

interface UseStoreOptionsParams {
  search?: string
  status?: StoreStatus
}

interface UseStoresParams {
  page?: number
  limit?: number
  search?: string
  status?: StoreStatus
  plan?: Plan
}

export function useStores({
  page = 1,
  limit = 10,
  search,
  status,
  plan,
}: UseStoresParams = {}) {
  const filters = { page, limit, search, status, plan }

  return useQuery(
    queryOptions({
      queryKey: storeKeys.list(filters),
      queryFn: async () => await getStores(filters),
      placeholderData: (previousData) => previousData,
    }),
  )
}

export function useCheckStoreAvailability(
  params: { name?: string; slug?: string; excludeId?: string },
  options?: { enabled?: boolean },
) {
  return useQuery(
    queryOptions({
      queryKey: storeKeys.availability(params),
      queryFn: () => checkStoreAvailability(params),
      enabled: options?.enabled ?? (!!params.name || !!params.slug),
    }),
  )
}

export function useStoreOptions(filters?: UseStoreOptionsParams) {
  return useQuery(
    queryOptions({
      queryKey: storeKeys.options(filters),
      queryFn: async () => await getStoreOptions(filters),
    }),
  )
}

export function useCreateStore() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: CreateStoreInput) => await createStore(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: storeKeys.all })
    },
  })
}

export function useUpdateStore() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      id,
      input,
    }: {
      id: string
      input: UpdateStoreInput
    }) => await updateStore(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: storeKeys.all })
    },
  })
}

export function useDeleteStore() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => await deleteStore(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: storeKeys.all })
    },
  })
}

export function useLandingStores(
  limit: number = 11,
  initialData?: StoreLandingItem[],
) {
  return useQuery(
    queryOptions({
      queryKey: storeKeys.landing(limit),
      queryFn: async () => await getLandingStores(limit),
      initialData,
      staleTime: 60 * 1000,
    }),
  )
}

export function useMerchantStoreSetup(storeId: string) {
  return useQuery(
    queryOptions({
      queryKey: storeKeys.setupStatus(storeId),
      queryFn: () => getStoreSetupStatus(storeId),
      enabled: Boolean(storeId && storeId !== ALL_STORES),
    }),
  )
}
