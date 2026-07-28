'use client'

import { DefaultRole } from '@/generated/prisma/enums'
import { useMutation, useQueryClient } from '@tanstack/react-query'

import { resetStoreRolePermissions } from '../permission'
import { employeeKeys } from '../query-keys/employee'

export function useResetStoreRolePermissions() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      storeId,
      employeeId,
      branchId,
      roleName,
    }: {
      storeId: string
      employeeId: string
      branchId: string
      roleName: DefaultRole
    }) =>
      await resetStoreRolePermissions(storeId, employeeId, roleName, branchId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: employeeKeys.all })
    },
  })
}
