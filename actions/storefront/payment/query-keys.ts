export const storefrontPaymentKeys = {
  all: ['storefront-payment'] as const,
  storefrontOptions: (storeSlug: string) =>
    [...storefrontPaymentKeys.all, 'options', storeSlug] as const,
}
