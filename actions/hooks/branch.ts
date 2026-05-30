import {
  queryOptions,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'

import {
  CreateBranchInput,
  UpdateBranchInput,
  createBranch,
  deleteBranch,
  getBranch,
  getBranches,
  setMainBranch,
  updateBranch,
} from '../branch'
import { branchKeys } from '../query-keys/branch'

interface UseBranchesParams {
  storeId: string
  page?: number
  limit?: number
  search?: string
}

export function useBranches({
  storeId,
  page = 1,
  limit = 10,
  search,
}: UseBranchesParams) {
  const filters = { storeId, page, limit, search }

  return useQuery(
    queryOptions({
      queryKey: branchKeys.list(filters),
      queryFn: async () => await getBranches(filters),
      enabled: !!storeId,
      placeholderData: (previousData) => previousData,
    }),
  )
}

export function useBranch(id: string) {
  return useQuery(
    queryOptions({
      queryKey: branchKeys.detail(id),
      queryFn: async () => await getBranch(id),
      enabled: !!id,
    }),
  )
}

export function useCreateBranch() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: CreateBranchInput) => await createBranch(input),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: branchKeys.lists(),
      })
    },
  })
}

export function useUpdateBranch() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      id,
      input,
    }: {
      id: string
      input: UpdateBranchInput
    }) => await updateBranch(id, input),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: branchKeys.lists() })
      queryClient.invalidateQueries({
        queryKey: branchKeys.detail(data.updatedBranch.id),
      })
    },
  })
}

export function useSetMainBranch() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, storeId }: { id: string; storeId: string }) =>
      await setMainBranch(id, storeId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: branchKeys.lists() })
      queryClient.invalidateQueries({
        queryKey: branchKeys.detail(variables.id),
      })
    },
  })
}

export function useDeleteBranch() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, storeId }: { id: string; storeId: string }) =>
      await deleteBranch(id, storeId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: branchKeys.lists() })
    },
  })
}
