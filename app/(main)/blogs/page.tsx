import { Suspense } from 'react'

import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'

import { CtaSection } from '@/components/landing-template/CtaSection'
import { MainLayout } from '@/components/layout/Layout'

import { BlogsGridSection } from './_components/BlogsGridSection'
import { BlogsHeroSection } from './_components/BlogsHeroSection'

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('blogs.meta')
  return {
    title: t('title'),
    description: t('description'),
    alternates: {
      canonical: '/blogs',
      languages: {
        th: '/blogs?lang=th',
        en: '/blogs?lang=en',
      },
    },
  }
}

export default function BlogsPage() {
  return (
    <MainLayout className="flex flex-col items-center gap-8 overflow-hidden pt-2 pb-10 sm:gap-12 sm:pt-4 sm:pb-12 md:gap-20 lg:gap-24">
      <Suspense>
        <BlogsHeroSection />
        <BlogsGridSection />
        <CtaSection />
      </Suspense>
    </MainLayout>
  )
}
