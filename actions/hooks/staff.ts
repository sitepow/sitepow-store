import { StaffRole } from '@/generated/prisma/enums'
import { useBranchFilter } from '@/stores/use-branch-filter'
import { ALL_STORES, useStoreFilter } from '@/stores/use-store-filter'
import {
  queryOptions,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'

import { staffKeys } from '../query-keys/staff'
import {
  CreateStaffInput,
  UpdateStaffInput,
  createStaff,
  deleteStaff,
  getStaff,
  getStaffPermission,
  getStaffs,
  updateStaff,
} from '../staff'

interface UseStaffsParams {
  storeId: string
  page?: number
  limit?: number
  search?: string
  role?: StaffRole
}

export function useStaffs({
  storeId,
  page = 1,
  limit = 10,
  search,
  role,
}: UseStaffsParams) {
  const filters = { storeId, page, limit, search, role }

  return useQuery(
    queryOptions({
      queryKey: staffKeys.list(filters),
      queryFn: async () => await getStaffs(filters),
      enabled: !!storeId,
      placeholderData: (previousData) => previousData,
    }),
  )
}

export function useCreateStaff() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: CreateStaffInput) => await createStaff(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: staffKeys.all })
    },
  })
}

export function useUpdateStaff() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      id,
      input,
    }: {
      id: string
      input: UpdateStaffInput
    }) => await updateStaff(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: staffKeys.all })
    },
  })
}

export function useDeleteStaff() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => await deleteStaff(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: staffKeys.all })
    },
  })
}

export function useStaffPermission() {
  const { selectedStoreId } = useStoreFilter()
  const { selectedBranchId } = useBranchFilter()

  const {
    data: staffInfo,
    isLoading,
    error,
  } = useQuery(
    queryOptions({
      queryKey: staffKeys.currentStore(selectedStoreId, selectedBranchId),
      queryFn: () => getStaffPermission(selectedStoreId, selectedBranchId),
      enabled:
        !!selectedStoreId &&
        selectedStoreId !== ALL_STORES &&
        !!selectedBranchId,
    }),
  )

  const role = staffInfo?.role

  const isAdmin = role === StaffRole.ADMIN
  const isManager = role === StaffRole.MANAGER
  const isCashier = role === StaffRole.CASHIER

  return {
    staffInfo,
    isLoading,
    error,
    isAdmin,
    isManager,
    isCashier,
    ...staffInfo?.permissions,
  }
}

export function useStaff(id: string) {
  return useQuery(
    queryOptions({
      queryKey: staffKeys.detail(id),
      queryFn: async () => await getStaff(id),
      enabled: !!id,
    }),
  )
}
