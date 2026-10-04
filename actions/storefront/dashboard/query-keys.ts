export const storefrontDashboardKeys = {
  all: ['storefront', 'dashboard'] as const,
  detail: (storeSlug: string) =>
    [...storefrontDashboardKeys.all, storeSlug] as const,
}
