export const storefrontAddressKeys = {
  all: ['addresses'] as const,
  lists: (storeSlug?: string) =>
    [...storefrontAddressKeys.all, 'list', storeSlug] as const,
  options: (storeSlug?: string) =>
    [...storefrontAddressKeys.all, 'options', storeSlug] as const,
}
