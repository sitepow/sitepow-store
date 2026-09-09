import { Suspense } from 'react'

import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { notFound } from 'next/navigation'

import {
  FEATURE_METAS,
  getLocalizedFeature,
  getLocalizedFeatures,
} from '@/constants/features'
import { UserRole } from '@/generated/prisma/enums'

import { CtaSection } from '@/components/landing-template/CtaSection'
import { MainLayout } from '@/components/layout/Layout'

import { FeatureCapabilitiesSection } from './_components/FeatureCapabilitiesSection'
import { FeatureComparisonSection } from './_components/FeatureComparisonSection'
import { FeatureFaqSection } from './_components/FeatureFaqSection'
import { FeatureHeroSection } from './_components/FeatureHeroSection'
import { FeaturePreviewSection } from './_components/FeaturePreviewSection'
import { FeatureWorkflowSection } from './_components/FeatureWorkflowSection'
import { RelatedFeaturesSection } from './_components/RelatedFeaturesSection'

interface FeaturePageProps {
  params: Promise<{ slug: string }>
}

export function generateStaticParams() {
  return FEATURE_METAS.map((feature) => ({
    slug: feature.slug,
  }))
}

export async function generateMetadata({
  params,
}: FeaturePageProps): Promise<Metadata> {
  const { slug } = await params
  const t = await getTranslations('features')
  const feature = getLocalizedFeature(slug, t)
  if (!feature) {
    return {
      title: 'Sitepow Store',
    }
  }
  return {
    title: `${feature.title} | Sitepow Store`,
    description: feature.shortDescription,
    alternates: {
      canonical: `/features/${feature.slug}`,
      languages: {
        th: `/features/${feature.slug}?lang=th`,
        en: `/features/${feature.slug}?lang=en`,
      },
    },
    openGraph: {
      title: `${feature.title} | Sitepow Store`,
      description: feature.shortDescription,
    },
  }
}

export default async function FeatureDetailPage({ params }: FeaturePageProps) {
  const { slug } = await params
  const t = await getTranslations('features')
  const feature = getLocalizedFeature(slug, t)
  if (!feature) {
    notFound()
  }
  const allFeatures = getLocalizedFeatures(t)
  const relatedFeatures = allFeatures
    .filter((f) => f.slug !== feature.slug)
    .slice(0, 3)
  const registerParams = new URLSearchParams()
  registerParams.set('role', UserRole.MERCHANT)
  registerParams.set('callbackUrl', '/merchant/dashboard')
  const registerHref = `/register?${registerParams.toString()}`
  return (
    <MainLayout className="flex flex-col items-center gap-8 overflow-hidden pt-2 pb-10 sm:gap-12 sm:pt-4 sm:pb-12 md:gap-20 lg:gap-24">
      <Suspense>
        <FeatureHeroSection feature={feature} registerHref={registerHref} />
        <FeaturePreviewSection slug={feature.slug} imageSrc={feature.image} />
        <FeatureComparisonSection comparison={feature.comparison} />
        <FeatureWorkflowSection workflow={feature.workflow} />
        <FeatureCapabilitiesSection capabilities={feature.capabilities} />
        <FeatureFaqSection faqs={feature.faqs} featureTitle={feature.title} />
        <RelatedFeaturesSection relatedFeatures={relatedFeatures} />
        <CtaSection />
      </Suspense>
    </MainLayout>
  )
}
