'use client'

import { useMemo } from 'react'

import { useTranslations } from 'next-intl'

import { MainFaqAccordion } from '@/app/(main)/_components/MainFaqAccordion'
import { MainSectionHeader } from '@/app/(main)/_components/MainSectionHeader'

export function BuyoutFaq() {
  const t = useTranslations('buyout.faq')

  const items = useMemo(() => {
    try {
      const rawItems = t.raw('items') as Array<{ q: string; a: string }>
      if (Array.isArray(rawItems)) return rawItems
    } catch {}

    return [0, 1, 2, 3, 4].map((idx) => ({
      q: t(`items.${idx}.q`),
      a: t(`items.${idx}.a`),
    }))
  }, [t])

  return (
    <section
      id="buyout-faq"
      className="border-border/40 relative w-full border-t py-10 sm:py-16 md:py-24"
    >
      <div className="mx-auto w-full max-w-4xl space-y-4 px-3.5 sm:space-y-8 sm:px-6 lg:px-8">
        <div>
          <MainSectionHeader title={t('title')} />
        </div>

        <div>
          <MainFaqAccordion items={items} idPrefix="buyout-faq" />
        </div>
      </div>
    </section>
  )
}
