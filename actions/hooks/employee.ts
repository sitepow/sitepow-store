'use client'

import { PermissionRole } from '@/generated/prisma/enums'
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
    data: employeeInfo,
    isLoading,
    error,
  } = useQuery(
    queryOptions({
      queryKey: employeeKeys.currentStore(selectedStoreId, selectedBranchId),
      queryFn: () => getEmployeePermission(selectedStoreId, selectedBranchId),
      enabled:
        !!selectedStoreId &&
        selectedStoreId !== ALL_STORES &&
        !!selectedBranchId,
    }),
  )

  const roleName = employeeInfo?.role?.name

  const isOwner = employeeInfo?.isOwner ?? false
  const isAdmin = roleName === PermissionRole.ADMIN
  const isManager = roleName === PermissionRole.MANAGER
  const isCashier = roleName === PermissionRole.CASHIER

  const hasBranchAccess = employeeInfo?.hasBranchAccess ?? false

  const hasPermission = (permissionKey: PermissionKey): boolean => {
    if (!isOwner && !isAdmin && !hasBranchAccess) {
      return false
    }

    if (isOwner || isAdmin) {
      return true
    }
    return employeeInfo?.permissions?.includes(permissionKey) ?? false
  }

  return {
    employeeInfo,
    isLoading,
    error,
    isOwner,
    isAdmin,
    isManager,
    isCashier,
    hasBranchAccess,
    hasPermission,
    canViewDashboard: hasPermission('canViewDashboard'),
    canViewCreditCard: hasPermission('canViewCreditCard'),
    canManageEmployee: hasPermission('canManageEmployee'),
    canManageProducts: hasPermission('canManageProducts'),
    canManageInventory: hasPermission('canManageInventory'),
    canManageStock: hasPermission('canManageStock'),
    canCreateOrder: hasPermission('canCreateOrder'),
    canManageOrders: hasPermission('canManageOrders'),
    canCancelOrder: hasPermission('canCancelOrder'),
    canManageCoupons: hasPermission('canManageCoupons'),
    canManageCustomers: hasPermission('canManageCustomers'),
    canManageStoreSettings: hasPermission('canManageStoreSettings'),
    canViewFinance: hasPermission('canViewFinance'),
    canViewActivityLogs: hasPermission('canViewActivityLogs'),
    canManageSubscription: hasPermission('canManageSubscription'),
    canManageBlogs: hasPermission('canManageBlogs'),
    canManageBranches: hasPermission('canManageBranches'),
    canManageStoreProfile: hasPermission('canManageStoreProfile'),
    canManageSecurity: hasPermission('canManageSecurity'),
    canManageNotifications: hasPermission('canManageNotifications'),
    canTransferStore: hasPermission('canTransferStore'),
    canManageTax: hasPermission('canManageTax'),
    canManageShipping: hasPermission('canManageShipping'),
    canManagePayment: hasPermission('canManagePayment'),
  }
}
