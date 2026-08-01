export const blogKeys = {
  all: ['blogs'] as const,
  lists: () => [...blogKeys.all, 'list'] as const,
  list: (filters: {
    storeId?: string
    page?: number
    limit?: number
    search?: string
  }) => [...blogKeys.lists(), filters] as const,
  details: () => [...blogKeys.all, 'detail'] as const,
  detail: (slug: string, storeId?: string) =>
    [...blogKeys.details(), { storeId, slug }] as const,
}
