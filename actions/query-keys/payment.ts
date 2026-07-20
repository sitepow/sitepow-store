export const paymentKeys = {
  all: ['payment'] as const,
  settings: (storeId: string) =>
    [...paymentKeys.all, 'settings', storeId] as const,
  bankAccount: (id: string) =>
    [...paymentKeys.all, 'bank-account', id] as const,
}
