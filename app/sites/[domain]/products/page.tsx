import { Metadata } from 'next'

import { getStore } from '@/actions/store'
import {
  buildRobots,
  getStorePreviewImage,
  getStoreUrl,
} from '@/utils/storefront-seo'

import { SectionContainer } from '@/components/SectionContainer'

import { StoreLayout } from '../_components/layout/Layout'
import { ProductFilterControl } from './_components/ProductFilterControl'
import { ProductFilterResults } from './_components/ProductFilterResults'

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
  const canonicalUrl = `${url}/products`
  const title = `สินค้าทั้งหมด`
  const description =
    store.seoDescription ||
    store.description ||
    `เลือกชมสินค้าทั้งหมดจากร้าน ${store.name} สินค้าคุณภาพ ราคาคุ้มค่า สั่งซื้อง่าย จัดส่งรวดเร็ว`

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

export default async function StoreProductPage({ params }: Props) {
  const { domain } = await params

  return (
    <StoreLayout>
      <SectionContainer>
        <div className="grid w-full items-start gap-10 xl:grid-cols-12">
          <ProductFilterControl storeSlug={domain} />
          <ProductFilterResults storeSlug={domain} />
        </div>
      </SectionContainer>
    </StoreLayout>
  )
}
