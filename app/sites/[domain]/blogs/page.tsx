import { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'

import { getStore } from '@/actions/store'
import {
  buildRobots,
  getStorePreviewImage,
  getStoreUrl,
} from '@/utils/storefront-seo'

import { SectionContainer } from '@/components/SectionContainer'

import { StoreLayout } from '../_components/layout/Layout'
import { BlogsList } from './_components/BlogsList'

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
  const canonicalUrl = `${url}/blogs`
  const title = `บทความทั้งหมด`
  const description = `รวมบทความ สาระน่ารู้ และข่าวสารอัปเดตจากร้าน ${store.name}`

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

export default async function StoreBlogsPage({ params }: Props) {
  const { domain } = await params
  const t = await getTranslations('storefront.blogs')

  return (
    <StoreLayout>
      <SectionContainer>
        <h1 className="text-foreground text-4xl leading-tight font-bold">
          {t('allBlogs')}
        </h1>
        <BlogsList storeSlug={domain} />
      </SectionContainer>
    </StoreLayout>
  )
}
