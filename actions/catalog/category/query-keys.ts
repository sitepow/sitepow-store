export const categoryKeys = {
  all: ['categories'] as const,
  lists: () => [...categoryKeys.all, 'list'] as const,
  list: (filters: {
    page?: number
    limit?: number
    storeId?: string
    search?: string
  }) => [...categoryKeys.lists(), filters] as const,
  options: (filters?: { storeId?: string; search?: string }) =>
    [...categoryKeys.all, 'options', filters] as const,
  detail: (id: string) => [...categoryKeys.all, 'detail', id] as const,
}
