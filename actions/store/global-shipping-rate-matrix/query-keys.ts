export const globalShippingRateMatrixKeys = {
  all: ['globalShippingRateMatrix'] as const,
  lists: () => [...globalShippingRateMatrixKeys.all, 'list'] as const,
  detail: (province: string) =>
    [...globalShippingRateMatrixKeys.all, 'detail', province] as const,
}
