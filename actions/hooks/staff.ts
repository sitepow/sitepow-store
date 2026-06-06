import { StaffRole } from '@/generated/prisma/enums'
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
