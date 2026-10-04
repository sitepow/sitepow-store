import { storefrontProductKeys } from '@/actions/storefront/product/query-keys'
import { getStorefrontProducts } from '@/actions/storefront/product/actions'
import { getStoreByDomain } from '@/lib/tenant/store'
import { getQueryClient } from '@/lib/query/get-query-client'
import { getTenantBaseUrl } from '@/lib/tenant/seo'
import { dehydrate, HydrationBoundary } from '@tanstack/react-query'

import { TenantStoreJsonLd } from '@/components/seo/TenantStoreJsonLd'

import { StoreLayout } from './_components/layout/Layout'
import { BlogsSection } from './_components/section/Blogs'
import { CategoriesSection } from './_components/section/Categories'
import { ProductsSection } from './_components/section/Products'

export const revalidate = 60

type Props = {
  params: Promise<{ domain: string }>
}

export default async function StoreHomePage({ params }: Props) {
  const { domain } = await params

  const [store, baseUrl] = await Promise.all([
    getStoreByDomain(domain),
    getTenantBaseUrl(domain),
  ])

  const queryClient = getQueryClient()
  await queryClient.prefetchQuery({
    queryKey: storefrontProductKeys.list({
      storeSlug: domain,
      page: 1,
      limit: 8,
      search: '',
      categorySlug: '',
    }),
    queryFn: () =>
      getStorefrontProducts({
        storeSlug: domain,
        page: 1,
        limit: 8,
      }),
  })

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <StoreLayout>
        <h1 className="sr-only">
          {store?.name
            ? `${store.name} - ร้านค้าออนไลน์คุณภาพ`
            : 'ร้านค้าออนไลน์'}
        </h1>
        {store && <TenantStoreJsonLd store={store} baseUrl={baseUrl} />}
        <BlogsSection storeSlug={domain} />
        <CategoriesSection storeSlug={domain} />
        <ProductsSection storeSlug={domain} />
      </StoreLayout>
    </HydrationBoundary>
  )
}
