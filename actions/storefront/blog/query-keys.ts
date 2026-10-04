export const storefrontBlogKeys = {
  all: ['storefront', 'blogs'] as const,
  lists: () => [...storefrontBlogKeys.all, 'list'] as const,
  list: (filters: {
    storeSlug: string
    page?: number
    limit?: number
    search?: string
  }) => [...storefrontBlogKeys.lists(), filters] as const,
  detail: (storeSlug: string, blogSlug: string) =>
    [...storefrontBlogKeys.all, 'detail', storeSlug, blogSlug] as const,
}
