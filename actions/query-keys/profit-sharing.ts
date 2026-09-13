export const profitSharingKeys = {
  all: ['profit-sharing'] as const,
  partners: (storeId: string) =>
    [...profitSharingKeys.all, 'partners', storeId] as const,
  settlement: (storeId: string, period: string) =>
    [...profitSharingKeys.all, 'settlement', storeId, period] as const,
  history: (storeId: string) =>
    [...profitSharingKeys.all, 'history', storeId] as const,
}
