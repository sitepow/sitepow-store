import { Suspense } from 'react'

import type { Metadata } from 'next'
import { getLocale, getTranslations } from 'next-intl/server'

import { getStaticBlogs } from '@/constants/blogs'

import { BlogsSection } from '@/components/landing-template/BlogsSection'
import { CtaSection } from '@/components/landing-template/CtaSection'
import { FaqSection } from '@/components/landing-template/FaqSection'
import { FeaturesBentoSection } from '@/components/landing-template/FeaturesBentoSection'
import { HeroSection } from '@/components/landing-template/HeroSection'
import { HowItWorksSection } from '@/components/landing-template/HowItWorksSection'
import { LogosSection } from '@/components/landing-template/LogosSection'
import { PricingSection } from '@/components/landing-template/PricingSection'
import { ProblemSection } from '@/components/landing-template/ProblemSection'
import { SolutionSection } from '@/components/landing-template/SolutionSection'
import { MainLayout } from '@/components/layout/Layout'

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale()
  const isEn = locale === 'en'

  const title = isEn
    ? 'Sitepow Store | All-in-One E-Commerce & POS Platform 0% GP'
    : 'Sitepow Store | ระบบจัดการร้านค้าออนไลน์ ครบวงจร โปรแกรม POS สต็อกสินค้า 0% GP'

  const description = isEn
    ? 'All-in-one e-commerce management platform, multi-branch inventory, omnichannel POS, automated AI slip verification, reseller system. Start free with 0% GP commission.'
    : 'Sitepow Store แพลตฟอร์มระบบจัดการร้านค้าออนไลน์ครบวงจร รวมระบบหลังบ้าน จัดการสต็อกสินค้าหลายสาขา โปรแกรม POS หน้าร้าน AI ตรวจสลิปโอนเงิน ระบบตัวแทนจำหน่าย ขายฟรี 0% GP สมัครเปิดร้านฟรี'

  return {
    title,
    description,
    alternates: {
      canonical: 'https://sitepow.store',
      languages: {
        th: 'https://sitepow.store/?lang=th',
        en: 'https://sitepow.store/?lang=en',
      },
    },
    openGraph: {
      title,
      description,
      url: 'https://sitepow.store',
      siteName: 'Sitepow Store',
      locale: isEn ? 'en_US' : 'th_TH',
      type: 'website',
      images: [
        {
          url: 'https://sitepow.store/images/seo-cover.png',
          width: 1200,
          height: 630,
          alt: 'Sitepow Store - All-in-One eCommerce SaaS Platform',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: ['https://sitepow.store/images/seo-cover.png'],
    },
  }
}

export default async function HomePage() {
  const locale = await getLocale()
  const [
    tHero,
    tLogos,
    tProblem,
    tSolution,
    tHowItWorks,
    tBento,
    tPricingHome,
    tBlogs,
    tFaq,
    tCta,
  ] = await Promise.all([
    getTranslations('home.hero'),
    getTranslations('home.logos'),
    getTranslations('home.problem'),
    getTranslations('home.solution'),
    getTranslations('home.howItWorks'),
    getTranslations('home.featuresBento'),
    getTranslations('home.pricing'),
    getTranslations('home.blogs'),
    getTranslations('home.faq'),
    getTranslations('home.cta'),
  ])

  const staticBlogs = getStaticBlogs(locale).slice(0, 4)

  const faqItems = [0, 1, 2, 3, 4].map((idx) => ({
    q: tFaq(`items.${idx}.q`),
    a: tFaq(`items.${idx}.a`),
  }))

  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqItems.map((item) => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.a,
      },
    })),
  }

  const problemItems = [0, 1, 2].map((idx) => ({
    title: tProblem(`items.${idx}.title`),
    description: tProblem(`items.${idx}.description`),
  }))

  const solutionItems = [0, 1, 2].map((idx) => ({
    title: tSolution(`items.${idx}.title`),
    description: tSolution(`items.${idx}.description`),
  }))

  const howItWorksSteps = [0, 1, 2].map((idx) => ({
    title: tHowItWorks(`steps.${idx}.title`),
    description: tHowItWorks(`steps.${idx}.description`),
    badge: tHowItWorks(`steps.${idx}.badge`),
  }))

  return (
    <MainLayout className="-mt-12.5">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <Suspense>
        <HeroSection
          badgeNew={tHero('badgeNew')}
          badgeText={tHero('badgeText', { gp: 0 })}
          titleStart={tHero('titleStart')}
          titleGradient={tHero('titleGradient')}
          description={tHero('description')}
          registerBtn={tHero('registerBtn')}
          manageStoreBtn={tHero('manageStoreBtn')}
          downloadPosBtn={tHero('downloadPosBtn')}
          ratingText={tHero('ratingText', {
            rating: '4.9',
            merchants: '1,200',
          })}
          trust1={tHero('trust1', { gp: 0 })}
          trust2={tHero('trust2')}
          trust3={tHero('trust3', { minutes: 3 })}
          // Floating Badges Props
          floatSalesTitle={tHero('floating.salesTodayTitle')}
          floatSalesAmount={tHero('floating.salesTodayAmount', {
            amount: '24,850',
          })}
          floatSalesGrowth={tHero('floating.salesTodayGrowth', {
            rate: '32.4',
          })}
          floatQrTitle={tHero('floating.qrTitle')}
          floatQrDesc={tHero('floating.qrDesc', { gpRate: 0 })}
          floatStockTitle={tHero('floating.stockTitle')}
          floatStockDesc={tHero('floating.stockDesc', {
            item: 'House Blend',
            count: 3,
          })}
          floatOfflineTitle={tHero('floating.offlineTitle')}
          floatOfflineDesc={tHero('floating.offlineDesc')}
          floatSpeedTitle={tHero('floating.speedTitle', { time: '0.2' })}
          floatSpeedDesc={tHero('floating.speedDesc')}
          floatOrderTitle={tHero('floating.orderTitle', { orderNo: 'A-128' })}
          floatOrderDesc={tHero('floating.orderDesc')}
          floatCloudSyncText={tHero('floating.cloudSyncText')}
        />
      </Suspense>
      <LogosSection title={tLogos('title')} />
      <ProblemSection
        badge={tProblem('badge')}
        title={tProblem('title')}
        description={tProblem('description')}
        items={problemItems}
      />
      <SolutionSection
        badge={tSolution('badge')}
        title={tSolution('title')}
        description={tSolution('description')}
        items={solutionItems}
      />
      <HowItWorksSection
        badge={tHowItWorks('badge')}
        title={tHowItWorks('title')}
        description={tHowItWorks('description')}
        steps={howItWorksSteps}
      />
      <FeaturesBentoSection
        badge={tBento('badge')}
        title={tBento('title')}
        description={tBento('description')}
        allFeaturesBtn={tBento('allFeaturesBtn')}
        cards={{
          pos: {
            name: tBento('cards.pos.name'),
            description: tBento('cards.pos.description'),
            cta: tBento('cards.pos.cta'),
          },
          ai: {
            name: tBento('cards.ai.name'),
            description: tBento('cards.ai.description'),
            cta: tBento('cards.ai.cta'),
          },
          zeroGp: {
            name: tBento('cards.zeroGp.name'),
            description: tBento('cards.zeroGp.description'),
            cta: tBento('cards.zeroGp.cta'),
          },
          inventory: {
            name: tBento('cards.inventory.name'),
            description: tBento('cards.inventory.description'),
            cta: tBento('cards.inventory.cta'),
          },
          digital: {
            name: tBento('cards.digital.name'),
            description: tBento('cards.digital.description'),
            cta: tBento('cards.digital.cta'),
          },
          crm: {
            name: tBento('cards.crm.name'),
            description: tBento('cards.crm.description'),
            cta: tBento('cards.crm.cta'),
          },
        }}
      />
      <PricingSection
        badge={tPricingHome('badge')}
        title={tPricingHome('title')}
        description={tPricingHome('description')}
        compareLink={tPricingHome('compareLink')}
      />
      <BlogsSection
        badge={tBlogs('badge')}
        title={tBlogs('title')}
        description={tBlogs('description')}
        viewAll={tBlogs('viewAll')}
        readMore={tBlogs('readMore')}
        blogs={staticBlogs}
      />
      <FaqSection
        badge={tFaq('badge')}
        title={tFaq('title')}
        description={tFaq('description')}
        items={faqItems}
      />
      <CtaSection
        title={tCta('title')}
        description={tCta('description', { gp: 0 })}
        registerBtn={tCta('registerBtn')}
        dashboardBtn={tCta('dashboardBtn')}
        pricingBtn={tCta('pricingBtn')}
      />
    </MainLayout>
  )
}
