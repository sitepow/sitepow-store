export const aiUsageKeys = {
  all: ['ai-usage'] as const,
  credits: (ownerId: string, storeId?: string) =>
    [...aiUsageKeys.all, 'credits', ownerId, storeId] as const,
  logs: (filters: {
    ownerId: string
    storeId?: string
    page?: number
    limit?: number
  }) => [...aiUsageKeys.all, 'logs', filters] as const,
}
