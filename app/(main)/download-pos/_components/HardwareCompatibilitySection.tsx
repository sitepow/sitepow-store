'use client'
import { useTranslations } from 'next-intl'

import {
  IconCheck,
  IconDeviceDesktop,
  IconPrinter,
  IconScan,
  IconWallet,
} from '@tabler/icons-react'

import { MainSectionHeader } from '../../_components/MainSectionHeader'

const HARDWARE_ICONS = [IconPrinter, IconScan, IconWallet, IconDeviceDesktop]

export function HardwareCompatibilitySection() {
  const t = useTranslations('downloadPos.hardware')
  const items = [0, 1, 2, 3].map((idx) => {
    const Icon = HARDWARE_ICONS[idx]
    return {
      icon: <Icon size={26} />,
      title: t(`items.${idx}.title`),
      badge: t(`items.${idx}.badge`),
      description: t(`items.${idx}.description`),
      specs: [0, 1, 2, 3].map((sIdx) => t(`items.${idx}.specs.${sIdx}`)),
    }
  })

  return (
    <div className="mx-auto w-full max-w-7xl space-y-8 px-4 sm:px-6 lg:px-8">
      <MainSectionHeader
        badge={t('badge')}
        title={t('title')}
        description={t('description')}
      />
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {items.map((item, idx) => (
          <div
            key={idx}
            className="border-border/80 bg-card/60 hover:border-border relative flex flex-col justify-between rounded-3xl border p-5 shadow-xs transition-all duration-300 hover:shadow-md sm:p-6"
          >
            <div>
              <div className="flex items-center justify-between gap-4">
                <div className="bg-primary/10 text-primary flex size-10 items-center justify-center rounded-xl">
                  {item.icon}
                </div>
                <span className="bg-primary/10 text-primary rounded-full px-3 py-0.5 text-xs font-semibold">
                  {item.badge}
                </span>
              </div>
              <div className="pt-4">
                <h3 className="text-foreground text-lg font-bold">
                  {item.title}
                </h3>
                <p className="text-muted-foreground pt-2 text-xs leading-relaxed sm:text-sm">
                  {item.description}
                </p>
              </div>
              <div className="border-border/60 my-5 border-t" />
              <ul className="space-y-2.5 text-xs sm:text-sm">
                {item.specs.map((spec, sIdx) => (
                  <li key={sIdx} className="flex items-start gap-2.5">
                    <div
                      className="mt-0.5 shrink-0 text-emerald-500"
                      aria-hidden="true"
                    >
                      <IconCheck size={15} strokeWidth={2.5} />
                    </div>
                    <span className="text-foreground/90 leading-snug">
                      {spec}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
