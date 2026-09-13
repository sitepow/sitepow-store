import { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'

import { getStore } from '@/actions/store'
import {
  buildRobots,
  getStorePreviewImage,
  getStoreUrl,
} from '@/utils/storefront-seo'

import { StoreLayout } from './_components/layout/Layout'
import { BlogsSection } from './_components/section/Blogs'
import { CategoriesSection } from './_components/section/Categories'
import { ProductsSection } from './_components/section/Products'

type Props = {
  params: Promise<{ domain: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { domain } = await params
  const store = await getStore({ domain })

  if (!store) {
    return {}
  }

  const t = await getTranslations('storefront.metadata')
  const url = getStoreUrl(store, domain)
  const storeName = store.seoTitle || store.name
  const storeDescription =
    store.seoDescription ||
    store.description ||
    t('defaultDescription', { name: store.name })

  const previewImage = getStorePreviewImage(store, null, url)

  return {
    title: store.seoTitle || store.name,
    description: storeDescription,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title: storeName,
      description: storeDescription,
      url,
      siteName: store.name,
      locale: 'th_TH',
      images: [
        {
          url: previewImage,
          width: 1200,
          height: 630,
          alt: storeName,
        },
      ],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: storeName,
      description: storeDescription,
      images: [previewImage],
    },
    robots: buildRobots(store),
  }
}

export default async function StoreHomePage({ params }: Props) {
  const { domain } = await params

  return (
    <StoreLayout>
      <BlogsSection storeSlug={domain} />
      <CategoriesSection storeSlug={domain} />
      <ProductsSection storeSlug={domain} />
    </StoreLayout>
  )
}
