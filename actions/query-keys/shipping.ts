export const shippingKeys = {
  all: ['shipping'] as const,
  settings: (storeId: string) =>
    [...shippingKeys.all, 'settings', storeId] as const,
  matrix: (province: string) =>
    [...shippingKeys.all, 'matrix', province] as const,
}
