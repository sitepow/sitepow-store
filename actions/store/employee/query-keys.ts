export const employeeKeys = {
  all: ['employees'] as const,
  lists: () => [...employeeKeys.all, 'list'] as const,
  list: (filters: {
    storeId: string
    page?: number
    limit?: number
    search?: string
    roleId?: string
  }) => [...employeeKeys.lists(), filters] as const,
  detail: (id: string) => [...employeeKeys.all, 'detail', id] as const,
  currentStore: (storeId: string, branchId: string) =>
    [...employeeKeys.all, 'store', storeId, branchId] as const,
}
