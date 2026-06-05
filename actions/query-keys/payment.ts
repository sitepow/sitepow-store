export const paymentKeys = {
  all: ['payment'] as const,
  settings: (storeId: string) =>
    [...paymentKeys.all, 'settings', storeId] as const,
}
