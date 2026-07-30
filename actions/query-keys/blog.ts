export const blogKeys = {
  all: ['blogs'] as const,
  lists: () => [...blogKeys.all, 'list'] as const,
  list: (filters: {
    storeId?: string
    page?: number
    limit?: number
    search?: string
  }) => [...blogKeys.lists(), filters] as const,
  detail: (id: string) => [...blogKeys.all, 'detail', id] as const,
}
