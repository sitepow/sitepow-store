'use client'
import { useTranslations } from 'next-intl'

import { MainFaqAccordion } from '../../_components/MainFaqAccordion'
import { MainSectionHeader } from '../../_components/MainSectionHeader'

export function ContactFaqSection() {
  const t = useTranslations('contact.faq')
  const items = [0, 1, 2, 3].map((idx) => ({
    q: t(`items.${idx}.q`),
    a: t(`items.${idx}.a`),
  }))
  return (
    <div className="mx-auto w-full max-w-4xl space-y-4 px-3.5 sm:space-y-8 sm:px-6 lg:px-8">
      <MainSectionHeader
        badge={t('badge')}
        title={t('title')}
        description={t('description')}
      />
      <MainFaqAccordion items={items} idPrefix="contact-faq" />
    </div>
  )
}
