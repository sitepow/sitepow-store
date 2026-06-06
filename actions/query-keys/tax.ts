export const taxKeys = {
  all: ['tax'] as const,
  settings: (storeId: string) => [...taxKeys.all, 'settings', storeId] as const,
}
