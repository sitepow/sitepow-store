export const storeProfileKeys = {
  all: ['store-profile'] as const,
  detail: (storeId: string) => [...storeProfileKeys.all, storeId] as const,
}
