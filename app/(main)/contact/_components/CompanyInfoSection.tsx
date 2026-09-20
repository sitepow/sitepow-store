'use client'

import { useTranslations } from 'next-intl'

import {
  IconClock,
  IconPercentage,
  IconServer,
  IconShieldCheck,
} from '@tabler/icons-react'

import { MainSectionHeader } from '../../_components/MainSectionHeader'

const INFO_ICONS = [IconServer, IconShieldCheck, IconClock, IconPercentage]

export function CompanyInfoSection() {
  const t = useTranslations('contact.companyInfo')

  const items = INFO_ICONS.map((Icon, idx) => ({
    icon: <Icon size={22} className="sm:size-6" />,
    title: t(`items.${idx}.title`),
    description: t(`items.${idx}.description`),
  }))

  return (
    <div className="mx-auto w-full max-w-7xl space-y-4 px-3.5 sm:space-y-8 sm:px-6 lg:px-8">
      <div>
        <MainSectionHeader title={t('title')} />
      </div>

      <div className="grid grid-cols-1 gap-3 sm:gap-6 md:grid-cols-2 lg:grid-cols-4">
        {items.map((item, idx) => (
          <div
            key={idx}
            className="border-border/80 bg-card/60 hover:border-border relative flex flex-col justify-between rounded-2xl border p-4 shadow-xs transition-all duration-300 hover:shadow-md sm:rounded-3xl sm:p-6"
          >
            <div className="space-y-2 sm:space-y-3">
              <div className="bg-primary/10 text-primary mb-2.5 flex size-9 items-center justify-center rounded-xl sm:mb-4 sm:size-10">
                {item.icon}
              </div>
              <h3 className="text-foreground text-sm font-bold sm:text-base">
                {item.title}
              </h3>
              <p className="text-muted-foreground text-xs leading-relaxed">
                {item.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
