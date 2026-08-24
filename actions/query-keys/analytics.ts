export const analyticsKeys = {
  all: ['analytics'] as const,
  overview: (storeId: string, branchId?: string) =>
    [...analyticsKeys.all, 'overview', storeId, branchId ?? 'all'] as const,
}
