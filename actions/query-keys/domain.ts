export const domainKeys = {
  all: ['store-domain'] as const,
  detail: (storeId: string) => [...domainKeys.all, storeId] as const,
}
