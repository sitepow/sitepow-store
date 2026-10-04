export const customerKeys = {
  all: ['customers'] as const,
  lists: () => [...customerKeys.all, 'list'] as const,
  list: (filters: {
    storeId: string
    page?: number
    limit?: number
    search?: string
  }) => [...customerKeys.lists(), filters] as const,
  searchMember: (storeId: string, query: string) =>
    [...customerKeys.all, 'search-member', storeId, query] as const,
}
