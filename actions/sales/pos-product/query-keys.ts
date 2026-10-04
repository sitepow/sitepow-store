export const posProductKeys = {
  all: ['pos', 'products'] as const,
  list: (
    storeId: string,
    branchId: string,
    search?: string,
    categoryId?: string,
  ) =>
    [
      ...posProductKeys.all,
      'list',
      { storeId, branchId, search, categoryId },
    ] as const,
  resellerList: (
    agreementId: string,
    branchId: string,
    search?: string,
    categoryId?: string,
  ) =>
    [
      ...posProductKeys.all,
      'reseller-list',
      { agreementId, branchId, search, categoryId },
    ] as const,
}
