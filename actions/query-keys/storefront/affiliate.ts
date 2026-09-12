export const storefrontAffiliateKeys = {
  all: ['storefront', 'affiliate'] as const,
  dashboard: (storeSlug: string) =>
    [...storefrontAffiliateKeys.all, 'dashboard', storeSlug] as const,
  products: (storeSlug: string, search?: string) =>
    [...storefrontAffiliateKeys.all, 'products', storeSlug, search] as const,
}
