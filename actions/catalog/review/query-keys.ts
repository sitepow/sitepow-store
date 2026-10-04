export const reviewKeys = {
  all: ['reviews'] as const,
  lists: () => [...reviewKeys.all, 'list'] as const,
  list: (filters: {
    storeId: string
    page?: number
    limit?: number
    search?: string
  }) => [...reviewKeys.lists(), filters] as const,
  detail: (id: string) => [...reviewKeys.all, 'detail', id] as const,
}
