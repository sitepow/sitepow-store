import { Metadata } from 'next'

import { getStore } from '@/actions/store'
import { ABOUT_PAGE } from '@/constants/sites/page'
import {
  buildRobots,
  cleanDescription,
  getStorePreviewImage,
  getStoreUrl,
} from '@/utils/storefront-seo'

import { MarkdownRenderer } from '@/components/MarkdownRenderer'
import { SectionContainer } from '@/components/SectionContainer'

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
  const canonicalUrl = `${url}/about`
  const title = `เกี่ยวกับเรา`
  const description =
    cleanDescription(ABOUT_PAGE, 160) ||
    store.seoDescription ||
    store.description ||
    `เกี่ยวกับเรา ร้านค้า ${store.name}`

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

export default function StoreAboutPage() {
  return (
    <StoreLayout>
      <SectionContainer>
        <MarkdownRenderer content={ABOUT_PAGE} />
      </SectionContainer>
    </StoreLayout>
  )
}
