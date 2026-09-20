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
    <div className="mx-auto w-full max-w-7xl space-y-8 px-3.5 sm:space-y-12 sm:px-6 lg:px-8">
      <div>
        <MainSectionHeader title={t('title')} />
      </div>

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

      <div className="relative mx-auto mt-6 w-full max-w-5xl pt-2 sm:mt-10 sm:pt-4">
        <div
          aria-hidden="true"
          className="from-primary/20 pointer-events-none absolute -inset-3 -z-10 rounded-3xl bg-linear-to-r via-orange-500/10 to-amber-500/20 opacity-50 blur-2xl sm:-inset-6"
        />

        <div className="relative">
          <div className="bg-background/60 ring-border relative w-full overflow-hidden rounded-2xl border p-1.5 shadow-2xl ring-1 backdrop-blur-xl sm:rounded-3xl sm:p-2.5">
            <Safari
              url="pos.sitepow.store/cashier"
              className="w-full"
              videoSrc="/hero-section.mp4"
              deferVideo={true}
            >
              <div className="size-full bg-neutral-200 dark:bg-neutral-800" />
            </Safari>

            <BorderBeam
              size={220}
              duration={7}
              colorFrom="#f97316"
              colorTo="#3b82f6"
              borderWidth={1.5}
            />
            <BorderBeam
              size={220}
              duration={7}
              delay={3.5}
              colorFrom="#10b981"
              colorTo="#f59e0b"
              borderWidth={1.5}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
