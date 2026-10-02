function serializeParams(params?: Record<string, unknown>): string {
  if (!params || Object.keys(params).length === 0) return 'default'
  const filtered = Object.entries(params)
    .filter(([_, v]) => v !== undefined && v !== null && v !== '')
    .sort(([a], [b]) => a.localeCompare(b))
  if (filtered.length === 0) return 'default'
  return filtered
    .map(([k, v]) => `${k}=${encodeURIComponent(typeof v === 'object' ? JSON.stringify(v) : String(v))}`)
    .join('&')
}

export interface CacheKeyDefinition<TQueryKey extends readonly unknown[] = readonly unknown[]> {
  key: string
  pattern?: string
  queryKey: TQueryKey
}

export const CacheKeys = {
  product: {
    all: (storeId: string) => ({
      pattern: `tenant:${storeId}:products:*`,
      queryKey: ['tenant', storeId, 'products'] as const,
    }),

    lists: (storeId: string) => ({
      pattern: `tenant:${storeId}:products:list:*`,
      queryKey: ['tenant', storeId, 'products', 'list'] as const,
    }),

    list: (
      storeId: string,
      filters?: {
        page?: number
        limit?: number
        search?: string
        categoryId?: string
        isPublished?: boolean
      },
    ) => {
      const filterKey = serializeParams(filters)
      return {
        key: `tenant:${storeId}:products:list:${filterKey}`,
        queryKey: ['tenant', storeId, 'products', 'list', filters ?? {}] as const,
      }
    },

    detail: (storeId: string, productIdOrSlug: string) => ({
      key: `tenant:${storeId}:products:detail:${productIdOrSlug}`,
      queryKey: ['tenant', storeId, 'products', 'detail', productIdOrSlug] as const,
    }),

    options: (storeId: string) => ({
      key: `tenant:${storeId}:products:options`,
      queryKey: ['tenant', storeId, 'products', 'options'] as const,
    }),

    quota: (storeId: string) => ({
      key: `tenant:${storeId}:products:quota`,
      queryKey: ['tenant', storeId, 'products', 'quota'] as const,
    }),
  },

  inventory: {
    all: (storeId: string) => ({
      pattern: `tenant:${storeId}:inventory:*`,
      queryKey: ['tenant', storeId, 'inventory'] as const,
    }),

    lists: (storeId: string) => ({
      pattern: `tenant:${storeId}:inventory:list:*`,
      queryKey: ['tenant', storeId, 'inventory', 'list'] as const,
    }),

    list: (
      storeId: string,
      filters?: {
        branchId?: string
        page?: number
        limit?: number
        search?: string
      },
    ) => {
      const filterKey = serializeParams(filters)
      return {
        key: `tenant:${storeId}:inventory:list:${filterKey}`,
        queryKey: ['tenant', storeId, 'inventory', 'list', filters ?? {}] as const,
      }
    },

    byBranch: (storeId: string, branchId: string) => ({
      pattern: `tenant:${storeId}:inventory:branch:${branchId}:*`,
      queryKey: ['tenant', storeId, 'inventory', 'branch', branchId] as const,
    }),

    item: (storeId: string, branchId: string, variantId: string) => ({
      key: `tenant:${storeId}:inventory:branch:${branchId}:variant:${variantId}`,
      queryKey: ['tenant', storeId, 'inventory', 'branch', branchId, 'variant', variantId] as const,
    }),
  },

  pos: {
    all: (storeId: string) => ({
      pattern: `tenant:${storeId}:pos:*`,
      queryKey: ['tenant', storeId, 'pos'] as const,
    }),

    cart: (storeId: string, branchId: string, posSessionId: string) => ({
      key: `tenant:${storeId}:pos:branch:${branchId}:cart:${posSessionId}`,
      queryKey: ['tenant', storeId, 'pos', 'branch', branchId, 'cart', posSessionId] as const,
    }),

    products: (storeId: string, branchId: string, filters?: { search?: string; categoryId?: string }) => {
      const filterKey = serializeParams(filters)
      return {
        key: `tenant:${storeId}:pos:branch:${branchId}:products:${filterKey}`,
        pattern: `tenant:${storeId}:pos:branch:${branchId}:products:*`,
        queryKey: ['tenant', storeId, 'pos', 'branch', branchId, 'products', filters ?? {}] as const,
      }
    },

    orders: (storeId: string, branchId: string) => ({
      pattern: `tenant:${storeId}:pos:branch:${branchId}:orders:*`,
      queryKey: ['tenant', storeId, 'pos', 'branch', branchId, 'orders'] as const,
    }),
  },

  orders: {
    all: (storeId: string) => ({
      pattern: `tenant:${storeId}:orders:*`,
      queryKey: ['tenant', storeId, 'orders'] as const,
    }),

    list: (
      storeId: string,
      branchId?: string,
      filters?: {
        page?: number
        limit?: number
        search?: string
        status?: string
      },
    ) => {
      const branchScope = branchId || 'all'
      const filterKey = serializeParams(filters)
      return {
        key: `tenant:${storeId}:orders:list:${branchScope}:${filterKey}`,
        pattern: `tenant:${storeId}:orders:list:${branchScope}:*`,
        queryKey: ['tenant', storeId, 'orders', 'list', { branchId, ...filters }] as const,
      }
    },

    detail: (storeId: string, orderId: string) => ({
      key: `tenant:${storeId}:orders:detail:${orderId}`,
      queryKey: ['tenant', storeId, 'orders', 'detail', orderId] as const,
    }),
  },

  store: {
    all: (storeId: string) => ({
      pattern: `tenant:${storeId}:store:*`,
      queryKey: ['tenant', storeId, 'store'] as const,
    }),

    profile: (domainOrId: string) => ({
      key: `tenant:${domainOrId}:store:profile`,
      queryKey: ['tenant', domainOrId, 'store', 'profile'] as const,
    }),

    settings: (storeId: string) => ({
      key: `tenant:${storeId}:store:settings`,
      queryKey: ['tenant', storeId, 'store', 'settings'] as const,
    }),
  },

  storefront: {
    productsList: (storeSlug: string, filters?: Record<string, unknown>) => {
      const filterKey = serializeParams(filters)
      return {
        key: `storefront:tenant:${storeSlug}:products:list:${filterKey}`,
        pattern: `storefront:tenant:${storeSlug}:products:list:*`,
        queryKey: ['storefront', storeSlug, 'products', 'list', filters ?? {}] as const,
      }
    },
    productDetail: (storeSlug: string, productSlug: string) => ({
      key: `storefront:tenant:${storeSlug}:products:detail:${productSlug}`,
      queryKey: ['storefront', storeSlug, 'products', 'detail', productSlug] as const,
    }),
  },
} as const
