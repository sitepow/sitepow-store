export const analyticsKeys = {
  all: ['analytics'] as const,
  overview: (
    storeId: string,
    branchId?: string,
    startDate?: string,
    endDate?: string,
  ) =>
    [
      ...analyticsKeys.all,
      'overview',
      storeId,
      branchId ?? 'all',
      startDate ?? 'all',
      endDate ?? 'all',
    ] as const,
}
