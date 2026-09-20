'use client'

import { useTranslations } from 'next-intl'

import { MainSectionHeader } from '@/app/(main)/_components/MainSectionHeader'
import { IconCoins, IconReceipt2, IconRefreshAlert } from '@tabler/icons-react'

const PROBLEM_ICONS = [IconCoins, IconReceipt2, IconRefreshAlert]

export interface ProblemSectionProps {
  badge?: string
  title?: string
  description?: string
  items?: Array<{ title: string; description: string }>
}

export function ProblemSection({
  badge,
  title,
  description,
  items,
}: ProblemSectionProps = {}) {
  const t = useTranslations('home.problem')

  const resolvedBadge = badge ?? t('badge')
  const resolvedTitle = title ?? t('title')
  const resolvedDescription = description ?? t('description')

  const resolvedItems =
    items ??
    [0, 1, 2].map((idx) => ({
      title: t(`items.${idx}.title`),
      description: t(`items.${idx}.description`),
    }))

  const displayItems = resolvedItems.map((item, idx) => ({
    icon: PROBLEM_ICONS[idx % PROBLEM_ICONS.length],
    title: item.title,
    description: item.description,
  }))

  return (
    <section id="problem" className="relative w-full py-16 md:py-24">
      <div className="mx-auto w-full max-w-7xl space-y-8 px-4 sm:px-6 lg:px-8">
        <MainSectionHeader title={resolvedTitle} />

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {displayItems.map((prob, idx) => (
            <div
              key={idx}
              className="border-border/80 bg-card/60 hover:border-border hover:bg-card relative flex flex-col justify-between rounded-3xl border p-5 shadow-xs transition-all duration-300 hover:shadow-md sm:p-6"
            >
              <div>
                <div className="bg-primary/10 text-primary mb-4 flex size-10 items-center justify-center rounded-xl">
                  <prob.icon size={22} />
                </div>
                <h3 className="text-foreground text-lg font-bold">
                  {prob.title}
                </h3>
                <p className="text-muted-foreground pt-2 text-xs leading-relaxed sm:text-sm">
                  {prob.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
