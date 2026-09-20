'use client'

import React from 'react'

import { useTranslations } from 'next-intl'

import { MainSectionHeader } from '@/app/(main)/_components/MainSectionHeader'
import { IconCpu, IconFlame, IconQrcode } from '@tabler/icons-react'

import { Safari } from '@/components/magicui/safari'

const SOLUTION_CONFIGS = [
  {
    icon: <IconQrcode size={20} className="sm:size-5" />,
    url: 'pos.sitepow.store',
    videoSrc: '/pos-section.webm',
    accent: 'from-blue-500/15 text-blue-500',
  },
  {
    icon: <IconCpu size={20} className="sm:size-5" />,
    url: 'ai.sitepow.store',
    videoSrc: '/slip-verify.webm',
    accent: 'from-emerald-500/15 text-emerald-500',
  },
  {
    icon: <IconFlame size={20} className="sm:size-5" />,
    url: 'app.sitepow.store',
    videoSrc: '/gp-section.webm',
    accent: 'from-orange-500/15 text-orange-500',
  },
]

export interface SolutionSectionProps {
  badge?: string
  title?: string
  description?: string
  items?: Array<{ title: string; description: string }>
}

export function SolutionSection({
  badge,
  title,
  description,
  items,
}: SolutionSectionProps = {}) {
  const t = useTranslations('home.solution')

  const resolvedBadge = badge ?? t('badge')
  const resolvedTitle = title ?? t('title')
  const resolvedDescription = description ?? t('description')

  const displayItems = SOLUTION_CONFIGS.map((config, idx) => ({
    ...config,
    title: items?.[idx]?.title ?? t(`items.${idx}.title`),
    description: items?.[idx]?.description ?? t(`items.${idx}.description`),
  }))

  return (
    <section
      id="solution"
      className="bg-muted/30 border-border/40 relative w-full overflow-hidden border-y py-16 md:py-24"
    >
      <div className="mx-auto w-full max-w-7xl space-y-8 px-4 sm:px-6 lg:px-8">
        <MainSectionHeader title={resolvedTitle} />

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {displayItems.map((item, idx) => (
            <div
              key={idx}
              className="group border-border/80 bg-card hover:border-primary/50 relative flex flex-col justify-between overflow-hidden rounded-3xl border p-5 shadow-sm transition-all duration-300 hover:shadow-md sm:p-6"
            >
              <div>
                <div
                  className={`border-border/50 mb-4 flex size-10 items-center justify-center rounded-2xl border bg-linear-to-br to-transparent shadow-xs transition-transform duration-300 group-hover:scale-110 ${item.accent}`}
                >
                  {item.icon}
                </div>
                <h3 className="text-foreground group-hover:text-primary text-base font-bold transition-colors sm:text-lg">
                  {item.title}
                </h3>
                <p className="text-muted-foreground min-h-11 pt-1.5 text-xs leading-relaxed sm:text-sm">
                  {item.description}
                </p>
              </div>

              <div className="border-border/60 bg-muted/20 relative mt-5 overflow-hidden rounded-xl border shadow-inner transition-transform duration-300">
                <Safari
                  url={item.url}
                  mode={item.videoSrc ? undefined : 'simple'}
                  videoSrc={item.videoSrc}
                  deferVideo={true}
                  className="w-full"
                >
                  <div className="size-full min-h-36 bg-neutral-200 transition-colors dark:bg-neutral-800" />
                </Safari>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
