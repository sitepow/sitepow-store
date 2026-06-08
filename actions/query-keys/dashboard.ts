export const dashboardKeys = {
  all: ['dashboard'] as const,
  detail: (storeId: string) => [...dashboardKeys.all, storeId] as const,
}
