import { useCallback, useMemo } from 'react'

import { DefaultRole } from '@/generated/prisma/enums'
import { useBranchFilter } from '@/stores/use-branch-filter'
import { ALL_STORES, useStoreFilter } from '@/stores/use-store-filter'
import { PermissionKey } from '@/types/permission'
import {
  queryOptions,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'

import {
  CreateEmployeeInput,
  UpdateEmployeeInput,
  createEmployee,
  deleteEmployee,
  getEmployee,
  getEmployeePermission,
  getEmployees,
  resetEmployeePassword,
  updateEmployee,
} from '../employee'
import { employeeKeys } from '../query-keys/employee'

interface UseEmployeesParams {
  storeId: string
  page?: number
  limit?: number
  search?: string
  roleId?: string
}

export function useEmployees({
  storeId,
  page = 1,
  limit = 10,
  search,
  roleId,
}: UseEmployeesParams) {
  const filters = { storeId, page, limit, search, roleId }

  return useQuery(
    queryOptions({
      queryKey: employeeKeys.list(filters),
      queryFn: async () => await getEmployees(filters),
      enabled: !!storeId,
      placeholderData: (previousData) => previousData,
    }),
  )
}

export function useCreateEmployee() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: CreateEmployeeInput) =>
      await createEmployee(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: employeeKeys.all })
    },
  })
}

export function useUpdateEmployee() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      id,
      input,
    }: {
      id: string
      input: UpdateEmployeeInput
    }) => await updateEmployee(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: employeeKeys.all })
    },
  })
}

export function useEmployee(id: string) {
  return useQuery(
    queryOptions({
      queryKey: employeeKeys.detail(id),
      queryFn: async () => await getEmployee(id),
      enabled: !!id,
    }),
  )
}

export function useDeleteEmployee() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => await deleteEmployee(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: employeeKeys.all })
    },
  })
}

export function useResetEmployeePassword() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (employeeStoreId: string) =>
      await resetEmployeePassword(employeeStoreId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: employeeKeys.all })
    },
  })
}

export function useEmployeePermission(
  customStoreId?: string,
  customBranchId?: string,
) {
  const { selectedStoreId } = useStoreFilter()
  const { selectedBranchId } = useBranchFilter()

  const storeId = customStoreId ?? selectedStoreId
  const branchId = customBranchId ?? selectedBranchId

  const isNoStoreContext = !storeId || storeId === ALL_STORES

  const {
    data: employee,
    isLoading,
    error,
  } = useQuery(
    queryOptions({
      queryKey: employeeKeys.currentStore(storeId, branchId),
      queryFn: () => getEmployeePermission(storeId, branchId),
      enabled: !isNoStoreContext,
    }),
  )

  const roleName = employee?.role?.name

  const isOwner = employee?.isOwner ?? false
  const isRoleOwner = roleName === DefaultRole.OWNER
  const isManager = roleName === DefaultRole.MANAGER
  const isCashier = roleName === DefaultRole.CASHIER
  const isPosReseller = !isOwner && roleName === DefaultRole.POS_RESELLER

  const hasBranchAccess = employee?.hasBranchAccess ?? true
  const employeePermissions = employee?.permissions

  const hasPermission = useCallback(
    (permissionKey: PermissionKey): boolean => {
      if (isNoStoreContext) {
        if (
          permissionKey === 'canCreateStore' ||
          permissionKey === 'canViewStore'
        ) {
          return true
        }
        return false
      }

      if (!hasBranchAccess) {
        return false
      }

      if (isOwner || isRoleOwner) {
        return true
      }

      return employeePermissions?.includes(permissionKey) ?? false
    },
    [
      isNoStoreContext,
      hasBranchAccess,
      isOwner,
      isRoleOwner,
      employeePermissions,
    ],
  )

  return useMemo(() => {
    const baseValues = {
      employee,
      isLoading: isNoStoreContext ? false : isLoading,
      error,
      isOwner,
      isRoleOwner,
      isManager,
      isCashier,
      isPosReseller,
      hasBranchAccess,
      hasPermission,
    }

    return new Proxy(baseValues, {
      get(target, prop: string) {
        if (prop in target) {
          return target[prop as keyof typeof target]
        }

        if (prop.startsWith('can')) {
          return hasPermission(prop as PermissionKey)
        }

        return undefined
      },
    }) as typeof baseValues & Record<PermissionKey, boolean>
  }, [
    isNoStoreContext,
    employee,
    isLoading,
    error,
    isOwner,
    isRoleOwner,
    isManager,
    isCashier,
    hasBranchAccess,
    hasPermission,
  ])
}
