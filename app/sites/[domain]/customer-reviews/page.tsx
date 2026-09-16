import { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { getStore } from '@/actions/store'
import {
  getStoreCustomerReviews,
  getStoreReviewSummary,
} from '@/actions/storefront/review'
import {
  buildRobots,
  getStorePreviewImage,
  getStoreUrl,
} from '@/utils/storefront-seo'

import { SectionContainer } from '@/components/SectionContainer'

import { StoreLayout } from '../_components/layout/Layout'
import { CustomerReviewsClient } from './_components/CustomerReviewsClient'

type Props = {
  params: Promise<{ domain: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { domain } = await params
  const store = await getStore({ domain })

  if (!store) {
    return {}
  }

  const summary = await getStoreReviewSummary(store.id)

  const url = getStoreUrl(store, domain)
  const canonicalUrl = `${url}/customer-reviews`
  const title = `รีวิวจากลูกค้า`
  const description =
    summary.totalReviews > 0
      ? `อ่านรีวิวและความคิดเห็นจริงจากลูกค้าที่ซื้อสินค้ากับร้าน ${store.name} คะแนนเฉลี่ย ${summary.averageRating.toFixed(1)}/5 จากทั้งหมด ${summary.totalReviews} รีวิว`
      : store.seoDescription ||
        store.description ||
        `อ่านรีวิวและความประทับใจจากลูกค้าที่ซื้อสินค้ากับร้าน ${store.name}`

  const previewImage = getStorePreviewImage(store, null, url)

  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: `${title} | ${store.name}`,
      description,
      url: canonicalUrl,
      siteName: store.name,
      locale: 'th_TH',
      images: [
        {
          url: previewImage,
          width: 1200,
          height: 630,
          alt: `${title} | ${store.name}`,
        },
      ],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${title} | ${store.name}`,
      description,
      images: [previewImage],
    },
    robots: buildRobots(store),
  }
}

export default async function StoreCustomerReviewsPage({ params }: Props) {
  const { domain } = await params
  const store = await getStore({ domain })

  if (!store) {
    notFound()
  }

  const [summary, initialReviews] = await Promise.all([
    getStoreReviewSummary(store.id),
    getStoreCustomerReviews({ storeId: store.id, page: 1, limit: 10 }),
  ])

  return (
    <StoreLayout>
      <SectionContainer className="w-full max-w-5xl items-stretch text-left">
        <CustomerReviewsClient
          storeId={store.id}
          storeName={store.name}
          initialSummary={summary}
          initialReviews={initialReviews}
        />
      </SectionContainer>
    </StoreLayout>
  )
}
