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
    supplierStoreId: string,
    branchId: string,
    search?: string,
    categoryId?: string,
  ) =>
    [
      ...posProductKeys.all,
      'reseller-list',
      { supplierStoreId, branchId, search, categoryId },
    ] as const,
}
