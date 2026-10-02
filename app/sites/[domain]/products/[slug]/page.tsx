import { Metadata } from 'next'

import { getStore } from '@/actions/store'
import { getStorefrontProductDetail } from '@/actions/storefront/product'
import { cleanDescription, getTenantBaseUrl } from '@/lib/tenant-seo'

import { SectionContainer } from '@/components/SectionContainer'
import { TenantProductJsonLd } from '@/components/seo/TenantProductJsonLd'

import { StoreLayout } from '../../_components/layout/Layout'
import { ProductGallery } from './_components/ProductGallery'
import { ProductPurchasePanel } from './_components/ProductPurchasePanel'
import { ProductRelated } from './_components/ProductRelated'
import { ProductReviewLists } from './_components/ProductReviewLists'
import { ProductSpecification } from './_components/ProductSpecification'

type Props = {
  params: Promise<{ domain: string; slug: string }>
}

function extractProductDescription(
  product: NonNullable<Awaited<ReturnType<typeof getStorefrontProductDetail>>>,
): string {
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
    getStore({ domain }),
    getStorefrontProductDetail(domain, slug),
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
    getStore({ domain }),
    getStorefrontProductDetail(domain, slug),
    getTenantBaseUrl(domain),
  ])

  const description = product ? extractProductDescription(product) : ''

  return (
    <StoreLayout>
      {store && product && (
        <TenantProductJsonLd
          product={product}
          storeName={store.name}
          baseUrl={baseUrl}
          description={description}
        />
      )}
      <SectionContainer>
        <div className="text-foreground grid w-full items-start gap-x-10 gap-y-5 text-start xl:grid-cols-12">
          <div className="flex flex-col gap-5 xl:col-span-7">
            <ProductGallery />
          </div>
          <div className="flex flex-col gap-5 xl:sticky xl:top-40 xl:col-span-5 xl:col-start-8 xl:row-start-1 xl:row-end-3">
            <ProductPurchasePanel storeSlug={domain} productSlug={slug} />
          </div>
          <div className="xl:col-span-7">
            <ProductSpecification />
            <ProductReviewLists />
          </div>
        </div>
        <div className="flex w-full">
          <ProductRelated />
        </div>
      </SectionContainer>
    </StoreLayout>
  )
}
