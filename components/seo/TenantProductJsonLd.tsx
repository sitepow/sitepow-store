import React from 'react'

import type { StorefrontProductDetail } from '@/actions/storefront/product'

interface TenantProductJsonLdProps {
  product: StorefrontProductDetail
  storeName: string
  baseUrl: string
  description?: string
}

function safeSerialize(data: object): string {
  return JSON.stringify(data).replace(/</g, '\\u003c')
}

export function TenantProductJsonLd({
  product,
  storeName,
  baseUrl,
  description,
}: TenantProductJsonLdProps) {
  const totalStock = product.variants.reduce((acc, v) => {
    const variantStock =
      v.stocks?.reduce((sAcc, s) => sAcc + (s.quantity || 0), 0) ?? 0
    return acc + variantStock
  }, 0)

  const prices = product.variants
    .map((v) => Number(v.price))
    .filter((p) => !isNaN(p) && p > 0)
  const lowestPrice = prices.length > 0 ? Math.min(...prices) : 0

  const primaryVariant = product.variants[0]
  const sku = primaryVariant?.sku || primaryVariant?.id || product.id
  const productUrl = `${baseUrl}/products/${product.slug}`
  const images = product.images.map((img) => img.url)

  const reviews = product.reviews || []
  const hasReviews = reviews.length > 0
  const averageRating = hasReviews
    ? Number(
        (
          reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
        ).toFixed(1),
      )
    : 5.0

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.title,
    image: images.length > 0 ? images : undefined,
    description:
      description ||
      `${product.title} สินค้าคุณภาพจากหมวดหมู่ ${product.category?.title || ''}`,
    sku: sku,
    brand: {
      '@type': 'Brand',
      name: storeName,
    },
    offers: {
      '@type': 'Offer',
      url: productUrl,
      priceCurrency: 'THB',
      price: lowestPrice.toString(),
      priceValidUntil: '2028-12-31',
      itemCondition: 'https://schema.org/NewCondition',
      availability:
        totalStock > 0
          ? 'https://schema.org/InStock'
          : 'https://schema.org/OutOfStock',
      seller: {
        '@type': 'Organization',
        name: storeName,
      },
    },
    ...(hasReviews && {
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: averageRating.toString(),
        reviewCount: reviews.length.toString(),
        bestRating: '5',
        worstRating: '1',
      },
      review: reviews.slice(0, 10).map((rev) => {
        const customerName = rev.customer
          ? `${rev.customer.firstName || ''} ${rev.customer.lastName || ''}`.trim()
          : 'ลูกค้าผู้ใช้งานจริง'

        return {
          '@type': 'Review',
          author: {
            '@type': 'Person',
            name: customerName || 'ลูกค้าผู้ใช้งานจริง',
          },
          datePublished: rev.date
            ? new Date(rev.date).toISOString().split('T')[0]
            : new Date().toISOString().split('T')[0],
          reviewBody: rev.comment || 'สินค้าคุณภาพ คุ้มค่าราคา',
          reviewRating: {
            '@type': 'Rating',
            ratingValue: (rev.rating || 5).toString(),
            bestRating: '5',
            worstRating: '1',
          },
        }
      }),
    }),
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: safeSerialize(schema) }}
    />
  )
}
