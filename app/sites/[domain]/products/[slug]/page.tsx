import { Suspense } from 'react'
import { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { storefrontProductKeys } from '@/actions/query-keys/storefront/product'
import {
  getProductBySlug,
  type StorefrontProductDetail,
} from '@/lib/data/product'
import { getStoreByDomain } from '@/lib/data/store'
import { getQueryClient } from '@/lib/get-query-client'
import { cleanDescription, getTenantBaseUrl } from '@/lib/tenant-seo'
import { dehydrate, HydrationBoundary } from '@tanstack/react-query'

import { SectionContainer } from '@/components/SectionContainer'
import { TenantProductJsonLd } from '@/components/seo/TenantProductJsonLd'

import { StoreLayout } from '../../_components/layout/Layout'
import { ProductGallery } from './_components/ProductGallery'
import { ProductPurchasePanel } from './_components/ProductPurchasePanel'
import {
  ProductRelated,
  ProductRelatedSkeleton,
} from './_components/ProductRelated'
import { ProductReviewLists } from './_components/ProductReviewLists'
import { ProductSpecification } from './_components/ProductSpecification'

export const revalidate = 60

type Props = {
  params: Promise<{ domain: string; slug: string }>
}

function extractProductDescription(product: StorefrontProductDetail): string {
  let rawDesc = ''

  if (typeof product.details === 'object' && product.details !== null) {
    const values = Object.values(product.details as Record<string, unknown>)
    rawDesc = values
      .map((v) => (typeof v === 'string' ? v : JSON.stringify(v)))
      .join(' ')
  }

  if (!rawDesc.trim()) {
    const categoryTitle = product.category?.title || 'สินค้าทั่วไป'
    rawDesc = `${product.title} สินค้าคุณภาพจากหมวดหมู่ ${categoryTitle} สั่งซื้อออนไลน์ได้แล้ววันนี้ รับประกันคุณภาพและจัดส่งรวดเร็ว`
  }

  return cleanDescription(rawDesc, 160)
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { domain, slug } = await params
  const [store, product] = await Promise.all([
    getStoreByDomain(domain),
    getProductBySlug(domain, slug),
  ])

  if (!store || !product) {
    return {
      title: 'ไม่พบสินค้าที่ต้องการ',
      description: 'สินค้าอาจถูกลบหรือหมดอายุไปแล้ว',
    }
  }

  const baseUrl = await getTenantBaseUrl(domain)
  const canonicalUrl = `${baseUrl}/products/${product.slug}`
  const description = extractProductDescription(product)
  const productImage =
    product.images?.[0]?.url ||
    store.coverImage ||
    store.logo ||
    '/images/default-product.jpg'

  return {
    title: `${product.title} - ซื้อออนไลน์ราคาพิเศษ`,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      type: 'website',
      url: canonicalUrl,
      title: `${product.title} - ซื้อออนไลน์ราคาพิเศษ | ${store.name}`,
      description,
      siteName: store.name,
      images: [
        {
          url: productImage,
          width: 800,
          height: 800,
          alt: product.title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${product.title} - ซื้อออนไลน์ราคาพิเศษ | ${store.name}`,
      description,
      images: [productImage],
    },
  }
}

export default async function StoreProductDescriptionPage({ params }: Props) {
  const { domain, slug } = await params

  const [store, product, baseUrl] = await Promise.all([
    getStoreByDomain(domain),
    getProductBySlug(domain, slug),
    getTenantBaseUrl(domain),
  ])

  if (!store || !product) {
    notFound()
  }

  const queryClient = getQueryClient()
  await queryClient.prefetchQuery({
    queryKey: storefrontProductKeys.detail(domain, slug),
    queryFn: () => getProductBySlug(domain, slug),
  })

  const description = extractProductDescription(product)

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <StoreLayout>
        <TenantProductJsonLd
          product={product}
          storeName={store.name}
          baseUrl={baseUrl}
          description={description}
        />

        <SectionContainer>
          <article
            itemScope
            itemType="https://schema.org/Product"
            className="text-foreground w-full"
          >
            <meta itemProp="name" content={product.title} />
            <meta itemProp="description" content={description} />
            {product.images?.[0]?.url && (
              <link itemProp="image" href={product.images[0].url} />
            )}

            <div className="grid w-full items-start gap-x-10 gap-y-5 text-start xl:grid-cols-12">
              <div className="flex flex-col gap-5 xl:col-span-7">
                <ProductGallery storeSlug={domain} productSlug={slug} />
              </div>

              <section
                aria-labelledby="product-purchase-section"
                className="flex flex-col gap-5 xl:sticky xl:top-40 xl:col-span-5 xl:col-start-8 xl:row-start-1 xl:row-end-3"
              >
                <h2 id="product-purchase-section" className="sr-only">
                  สั่งซื้อสินค้าและเลือกตัวเลือก
                </h2>
                <ProductPurchasePanel storeSlug={domain} productSlug={slug} />
              </section>

              <div className="xl:col-span-7">
                <ProductSpecification
                  storeSlug={domain}
                  productSlug={slug}
                />
                <ProductReviewLists storeSlug={domain} productSlug={slug} />
              </div>
            </div>

            <div className="mt-16 flex w-full">
              <Suspense fallback={<ProductRelatedSkeleton />}>
                <ProductRelated
                  productId={product.id}
                  categoryId={product.category?.id}
                  categorySlug={product.category?.slug}
                />
              </Suspense>
            </div>
          </article>
        </SectionContainer>
      </StoreLayout>
    </HydrationBoundary>
  )
}
