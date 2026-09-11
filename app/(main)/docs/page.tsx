import { Suspense } from 'react'

import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'

import { MainLayout } from '@/components/layout/Layout'

import { WebhookDocsContent } from './_components/WebhookDocsContent'

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('docs.meta')
  return {
    title: t('title'),
    description: t('description'),
    alternates: {
      canonical: '/docs',
      languages: {
        th: '/docs?lang=th',
        en: '/docs?lang=en',
      },
    },
  }
}

export default function DocsPage() {
  return (
    <MainLayout className="flex flex-col items-center gap-8 overflow-hidden pt-4 pb-12">
      <Suspense>
        <WebhookDocsContent />
      </Suspense>
    </MainLayout>
  )
}
