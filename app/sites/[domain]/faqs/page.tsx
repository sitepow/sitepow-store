import { Metadata } from 'next'

import { getStore } from '@/actions/store'
import { FAQ_PAGE } from '@/constants/sites/page'
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
  const canonicalUrl = `${url}/faqs`
  const title = `คำถามที่พบบ่อย (FAQs)`
  const content = store.faqsPage || FAQ_PAGE
  const description =
    cleanDescription(content, 160) ||
    store.seoDescription ||
    store.description ||
    `คำถามที่พบบ่อยและข้อมูลช่วยเหลือลูกค้าสำหรับร้าน ${store.name}`

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

export default async function StoreFaqsPage({ params }: Props) {
  const { domain } = await params
  const store = await getStore({ domain })
  const content = store?.faqsPage || FAQ_PAGE

  return (
    <StoreLayout>
      <SectionContainer>
        <MarkdownRenderer content={content} />
      </SectionContainer>
    </StoreLayout>
  )
}
