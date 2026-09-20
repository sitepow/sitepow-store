'use client'

import { useTranslations } from 'next-intl'

import { MainFaqAccordion } from '@/app/(main)/_components/MainFaqAccordion'
import { MainSectionHeader } from '@/app/(main)/_components/MainSectionHeader'

export interface FaqSectionProps {
  badge?: string
  title?: string
  description?: string
  items?: Array<{ q: string; a: string }>
}

export function FaqSection({
  badge,
  title,
  description,
  items: propItems,
}: FaqSectionProps = {}) {
  const t = useTranslations('home.faq')

  const resolvedBadge = badge ?? t('badge')
  const resolvedTitle = title ?? t('title')
  const resolvedDescription = description ?? t('description')

  const items =
    propItems ??
    [0, 1, 2, 3, 4].map((idx) => ({
      q: t(`items.${idx}.q`),
      a: t(`items.${idx}.a`),
    }))

  return (
    <section
      id="faq"
      className="border-border/40 relative w-full border-t py-10 sm:py-16 md:py-24"
    >
      <div className="mx-auto w-full max-w-4xl space-y-4 px-3.5 sm:space-y-8 sm:px-6 lg:px-8">
        <MainSectionHeader
          badge={resolvedBadge}
          title={resolvedTitle}
          description={resolvedDescription}
        />
        <MainFaqAccordion items={items} idPrefix="landing-faq" />
      </div>
    </section>
  )
}
