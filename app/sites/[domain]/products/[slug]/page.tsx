import { Metadata } from 'next'
import { getLocale } from 'next-intl/server'

import { getStore } from '@/actions/store'
import { getStorefrontProductDetail } from '@/actions/storefront/product'
import { getLocalizedField } from '@/utils/intl'
import {
  buildRobots,
  cleanDescription,
  generateProductJsonLd,
  getProductPreviewImage,
  getStoreUrl,
  toAbsoluteUrl,
} from '@/utils/storefront-seo'

import { SectionContainer } from '@/components/SectionContainer'

import { StoreLayout } from '../../_components/layout/Layout'
import { ProductGallery } from './_components/ProductGallery'
import { ProductPurchasePanel } from './_components/ProductPurchasePanel'
import { ProductRelated } from './_components/ProductRelated'
import { ProductReviewLists } from './_components/ProductReviewLists'
import { ProductSpecification } from './_components/ProductSpecification'

type Props = {
  params: Promise<{ domain: string; slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { domain, slug } = await params
  const [product, store] = await Promise.all([
    getStorefrontProductDetail(domain, slug),
    getStore({ domain }),
  ])

  if (!product || !store) {
    return {}
  }

  const locale = await getLocale()
  const productTitle =
    getLocalizedField(product, 'title', locale) || product.title
  const url = getStoreUrl(store, domain)
  const productUrl = `${url}/products/${product.slug}`

  const details = product.details as Record<string, unknown> | null | undefined
  const rawDesc =
    typeof details?.description === 'string' ? details.description : ''
  const productDescription =
    cleanDescription(rawDesc, 160) ||
    (product.category?.title
      ? `${productTitle} ในหมวดหมู่ ${product.category.title} จากร้าน ${store.name}`
      : `${productTitle} สินค้าคุณภาพจากร้าน ${store.name} สั่งซื้อง่าย จัดส่งรวดเร็ว`)

  // Fallback chain: isPrimary -> any image -> store cover -> store logo -> fallback
  const previewImage = getProductPreviewImage(product, store, url)
  const tags = product.tags?.map((t) => t.name) || undefined

  const prices = (product.variants || [])
    .map((v) => (v.price != null ? Number(v.price) : NaN))
    .filter((p) => !isNaN(p) && p >= 0)
  const minPrice = prices.length > 0 ? Math.min(...prices) : undefined
  const hasStock = (product.variants || []).some((v) => v.isAvailable !== false)

  const allImages = (product.images || [])
    .map((img) => toAbsoluteUrl(img.url, url))
    .filter(Boolean)
  const ogImages = [
    previewImage,
    ...allImages.filter((imgUrl) => imgUrl !== previewImage),
  ]
    .slice(0, 4)
    .map((imgUrl) => ({
      url: imgUrl,
      width: 1200,
      height: 630,
      alt: productTitle,
    }))

  return {
    title: productTitle,
    description: productDescription,
    keywords: tags,
    alternates: {
      canonical: productUrl,
    },
    openGraph: {
      title: `${productTitle} | ${store.name}`,
      description: productDescription,
      url: productUrl,
      siteName: store.name,
      locale: 'th_TH',
      images: ogImages,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${productTitle} | ${store.name}`,
      description: productDescription,
      images: [previewImage],
    },
    other: {
      ...(minPrice !== undefined
        ? {
            'product:price:amount': String(minPrice),
            'product:price:currency': store.baseCurrency || 'THB',
          }
        : {}),
      'product:availability': hasStock ? 'in stock' : 'out of stock',
    },
    robots: buildRobots(store),
  }
}

export default async function StoreProductDescriptionPage({ params }: Props) {
  const { domain, slug } = await params
  const [product, store] = await Promise.all([
    getStorefrontProductDetail(domain, slug),
    getStore({ domain }),
  ])

  const url = getStoreUrl(store, domain)
  const productUrl = `${url}/products/${slug}`
  const previewImage = getProductPreviewImage(product, store, url)

  const productJsonLd =
    product && store
      ? generateProductJsonLd(product, store, productUrl, previewImage)
      : null

  return (
    <StoreLayout>
      {productJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
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
