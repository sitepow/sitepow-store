'use client'
import { useTranslations } from 'next-intl'

import {
  IconBuildingStore,
  IconDownload,
  IconPlugConnected,
} from '@tabler/icons-react'

import { BorderBeam } from '@/components/magicui/border-beam'
import { Safari } from '@/components/magicui/safari'

import { MainSectionHeader } from '../../_components/MainSectionHeader'

const STEP_ICONS = [
  <IconDownload key="dl" size={18} className="sm:size-5" />,
  <IconBuildingStore key="bs" size={18} className="sm:size-5" />,
  <IconPlugConnected key="pc" size={18} className="sm:size-5" />,
]

export function QuickSetupSection() {
  const t = useTranslations('downloadPos.quickSetup')
  const steps = [0, 1, 2].map((idx) => ({
    step: `0${idx + 1}`,
    title: t(`steps.${idx}.title`),
    description: t(`steps.${idx}.description`),
    icon: STEP_ICONS[idx],
  }))

  return (
    <div className="mx-auto w-full max-w-7xl space-y-4 px-3.5 sm:space-y-8 sm:px-6 lg:px-8">
      <MainSectionHeader
        badge={t('badge')}
        title={t('title')}
        description={t('description')}
      />
      <div className="grid grid-cols-1 gap-3.5 sm:gap-6 md:grid-cols-3">
        {steps.map((s, idx) => (
          <div
            key={idx}
            className="border-border/80 bg-card/60 relative flex flex-col justify-between rounded-2xl border p-4 shadow-xs transition-all duration-300 hover:shadow-md sm:rounded-3xl sm:p-6"
          >
            <div className="space-y-2.5 sm:space-y-4">
              <div className="flex items-center justify-between">
                <span className="bg-primary text-primary-foreground rounded-full px-2.5 py-0.5 text-[11px] font-bold sm:px-3 sm:py-1 sm:text-xs">
                  Step {s.step}
                </span>
                <div className="bg-primary/10 text-primary flex size-8 items-center justify-center rounded-lg sm:size-10 sm:rounded-xl">
                  {s.icon}
                </div>
              </div>
              <h3 className="text-foreground text-base font-bold sm:text-lg">
                {s.title}
              </h3>
              <p className="text-muted-foreground text-xs leading-relaxed sm:text-sm">
                {s.description}
              </p>
            </div>
          </div>
        ))}
      </div>
      <div className="relative mx-auto w-full max-w-4xl pt-1 sm:pt-2">
        <div className="bg-card ring-border relative overflow-hidden rounded-2xl border p-1 shadow-2xl ring-1 sm:rounded-3xl sm:p-2">
          <Safari
            url="pos.sitepow.store/cashier"
            mode="simple"
            className="w-full"
          >
            <div className="size-full min-h-44 bg-neutral-200 transition-colors sm:min-h-72 dark:bg-neutral-800" />
          </Safari>
          <BorderBeam
            size={180}
            duration={8}
            colorFrom="#f97316"
            colorTo="#10b981"
            borderWidth={1.5}
          />
        </div>
      </div>
    </div>
  )
}
