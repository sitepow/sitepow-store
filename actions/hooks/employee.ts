'use client'

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

export function useEmployeePermission() {
  const { selectedStoreId } = useStoreFilter()
  const { selectedBranchId } = useBranchFilter()

  const {
    data: employee,
    isLoading,
    error,
  } = useQuery(
    queryOptions({
      queryKey: employeeKeys.currentStore(selectedStoreId, selectedBranchId),
      queryFn: () => getEmployeePermission(selectedStoreId, selectedBranchId),
      enabled: !!selectedStoreId && selectedStoreId !== ALL_STORES,
    }),
  )

  const roleName = employee?.role?.name

  const isOwner = employee?.isOwner ?? false
  const isRoleOwner = roleName === DefaultRole.OWNER
  const isManager = roleName === DefaultRole.MANAGER
  const isCashier = roleName === DefaultRole.CASHIER

  const hasBranchAccess = employee?.hasBranchAccess ?? true
  const employeePermissions = employee?.permissions

  const hasPermission = useCallback(
    (permissionKey: PermissionKey): boolean => {
      if (!hasBranchAccess) {
        return false
      }

      return employeePermissions?.includes(permissionKey) ?? false
    },
    [hasBranchAccess, employeePermissions],
  )

  return useMemo(() => {
    const baseValues = {
      employee,
      isLoading,
      error,
      isOwner,
      isRoleOwner,
      isManager,
      isCashier,
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
