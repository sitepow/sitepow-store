export const posOrderKeys = {
  all: ['pos', 'orders'] as const,
  list: (storeId: string, branchId: string) =>
    [...posOrderKeys.all, 'list', { storeId, branchId }] as const,
}
