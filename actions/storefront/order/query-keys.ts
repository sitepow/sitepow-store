export const storefrontOrderKeys = {
  all: ['storefront', 'order'] as const,
  lists: () => [...storefrontOrderKeys.all, 'list'] as const,
  list: (filters: object) => [...storefrontOrderKeys.lists(), filters] as const,
}
