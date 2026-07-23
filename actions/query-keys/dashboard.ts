export const dashboardKeys = {
  all: ['dashboard'] as const,
  detail: (storeId: string, branchId: string) =>
    [...dashboardKeys.all, storeId, branchId] as const,
}
