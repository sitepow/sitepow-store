export const procurementKeys = {
  all: ['procurement'] as const,
  list: (storeId: string) => [...procurementKeys.all, 'list', storeId] as const,
  detail: (id: string) => [...procurementKeys.all, 'detail', id] as const,
}

