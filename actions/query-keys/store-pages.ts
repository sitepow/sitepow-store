export const storePagesKeys = {
  all: ['store-pages'] as const,
  detail: (storeId: string) => [...storePagesKeys.all, storeId] as const,
}
