export const shippingKeys = {
  all: ['shipping'] as const,
  settings: (storeId: string, branchId: string) =>
    [...shippingKeys.all, 'settings', storeId, branchId] as const,
  matrix: (province: string) =>
    [...shippingKeys.all, 'matrix', province] as const,
}
