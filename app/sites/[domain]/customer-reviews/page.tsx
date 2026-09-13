import { Metadata } from 'next'

import { getStore } from '@/actions/store'
import {
  buildRobots,
  getStorePreviewImage,
  getStoreUrl,
} from '@/utils/storefront-seo'

import { StoreLayout } from '../_components/layout/Layout'

type Props = {
  params: Promise<{ domain: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { domain } = await params
  const store = await getStore({ domain })

  if (!store) {
    return {}
  }

  const url = getStoreUrl(store, domain)
  const canonicalUrl = `${url}/customer-reviews`
  const title = `รีวิวจากลูกค้า`
  const description =
    store.seoDescription ||
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

export default function StoreCustomerReviewsPage() {
  return <StoreLayout></StoreLayout>
}
