export const affiliateKeys = {
  all: ['affiliate'] as const,
  // Merchant query keys
  merchantSettings: (storeId: string) =>
    [...affiliateKeys.all, 'merchant', 'settings', storeId] as const,
  merchantStats: (storeId: string) =>
    [...affiliateKeys.all, 'merchant', 'stats', storeId] as const,
  merchantAffiliates: (storeId: string, params?: Record<string, any>) =>
    [...affiliateKeys.all, 'merchant', 'affiliates', storeId, params] as const,
  merchantReferrals: (storeId: string, params?: Record<string, any>) =>
    [...affiliateKeys.all, 'merchant', 'referrals', storeId, params] as const,
  merchantPayouts: (storeId: string, params?: Record<string, any>) =>
    [...affiliateKeys.all, 'merchant', 'payouts', storeId, params] as const,

  // Storefront query keys
  storefrontInfo: (storeSlug: string) =>
    [...affiliateKeys.all, 'storefront', 'info', storeSlug] as const,
  storefrontDashboard: (storeSlug: string) =>
    [...affiliateKeys.all, 'storefront', 'dashboard', storeSlug] as const,
  storefrontProducts: (storeSlug: string) =>
    [...affiliateKeys.all, 'storefront', 'products', storeSlug] as const,
}
