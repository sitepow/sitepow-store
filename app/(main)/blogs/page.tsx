import { Suspense } from 'react'

import type { Metadata } from 'next'
import { getLocale, getTranslations } from 'next-intl/server'

import { getStaticBlogs } from '@/constants/blogs'

import { CtaSection } from '@/components/landing-template/CtaSection'
import { MainLayout } from '@/components/layout/Layout'

import { BlogsGridSection } from './_components/BlogsGridSection'
import { BlogsHeroSection } from './_components/BlogsHeroSection'

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('blogs.meta')
  const locale = await getLocale()
  const isEn = locale === 'en'

  return {
    title: t('title'),
    description: t('description'),
    alternates: {
      canonical: 'https://sitepow.store/blogs',
      languages: {
        th: 'https://sitepow.store/blogs?lang=th',
        en: 'https://sitepow.store/blogs?lang=en',
      },
    },
    openGraph: {
      title: t('title'),
      description: t('description'),
      url: 'https://sitepow.store/blogs',
      siteName: 'Sitepow Store',
      locale: isEn ? 'en_US' : 'th_TH',
      type: 'website',
      images: [
        {
          url: 'https://sitepow.store/images/seo-cover.png',
          width: 1200,
          height: 630,
          alt: 'Sitepow Store Blogs',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: t('title'),
      description: t('description'),
      images: ['https://sitepow.store/images/seo-cover.png'],
    },
  }
}

export default async function BlogsPage() {
  const locale = await getLocale()
  const [tBlogs, tCta] = await Promise.all([
    getTranslations('blogs'),
    getTranslations('home.cta'),
  ])

  const allBlogs = getStaticBlogs(locale)

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: locale === 'en' ? 'Home' : 'หน้าแรก',
        item: 'https://sitepow.store',
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: tBlogs('badge'),
        item: 'https://sitepow.store/blogs',
      },
    ],
  }

  return (
    <MainLayout className="flex flex-col items-center gap-8 overflow-hidden pt-2 pb-10 sm:gap-12 sm:pt-4 sm:pb-12 md:gap-20 lg:gap-24">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <Suspense>
        <BlogsHeroSection
          badgeText={tBlogs('badge')}
          description={tBlogs('description')}
        />
        <BlogsGridSection
          initialBlogs={allBlogs}
          allTagsText={tBlogs('allTags')}
          searchPlaceholderText={tBlogs('searchPlaceholder')}
          noBlogsFoundText={tBlogs('noBlogsFound')}
          readMoreText={tBlogs('readMore')}
        />
        <CtaSection
          title={tCta('title')}
          description={tCta('description', { gp: 0 })}
          registerBtn={tCta('registerBtn')}
          dashboardBtn={tCta('dashboardBtn')}
        />
      </Suspense>
    </MainLayout>
  )
}
