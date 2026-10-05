export const storeTransferKeys = {
  all: ['store-transfers'] as const,
  lists: () => [...storeTransferKeys.all, 'list'] as const,
  list: (storeId: string) => [...storeTransferKeys.lists(), storeId] as const,
  byToken: (token: string) =>
    [...storeTransferKeys.all, 'token', token] as const,
}
