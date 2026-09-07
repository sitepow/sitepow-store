'use client'
import { useTranslations } from 'next-intl'
import Link from 'next/link'

import { FeatureFaq } from '@/constants/features'
import { IconHelpCircle } from '@tabler/icons-react'

import { MainFaqAccordion } from '../../../_components/MainFaqAccordion'
import { MainSectionHeader } from '../../../_components/MainSectionHeader'

export function FeatureFaqSection({
  faqs,
  featureTitle,
}: {
  faqs: FeatureFaq[]
  featureTitle: string
}) {
  const t = useTranslations('features.detail.faq')
  if (faqs.length === 0) return null
  return (
    <div className="mx-auto w-full max-w-4xl space-y-4 px-3.5 sm:space-y-6 sm:px-6 lg:px-8">
      <MainSectionHeader
        badge={t('badge')}
        title={`${t('titlePrefix')} ${featureTitle}`}
      />
      <MainFaqAccordion items={faqs} idPrefix="feature-faq" />
      <div className="pt-1 text-center sm:pt-2">
        <Link
          href="/contact"
          className="text-muted-foreground hover:text-primary inline-flex items-center gap-1.5 text-xs font-medium transition-colors"
        >
          <IconHelpCircle size={15} />
          <span>{t('moreQuestions')}</span>
        </Link>
      </div>
    </div>
  )
}
