'use client'
import { useTranslations } from 'next-intl'

import { FeatureCapability } from '@/constants/features'

import { MainSectionHeader } from '../../../_components/MainSectionHeader'

export function FeatureCapabilitiesSection({
  capabilities,
}: {
  capabilities: FeatureCapability[]
}) {
  const t = useTranslations('features.detail.capabilities')
  return (
    <div className="mx-auto w-full max-w-7xl space-y-4 px-3.5 sm:space-y-8 sm:px-6 lg:px-8">
      <MainSectionHeader badge={t('badge')} title={t('title')} />
      <div className="grid grid-cols-1 gap-3.5 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
        {capabilities.map((cap, cIdx) => (
          <div
            key={cIdx}
            className="border-border/80 bg-card/60 hover:border-border relative flex flex-col justify-between rounded-2xl border p-4 shadow-xs transition-all duration-300 hover:shadow-md sm:rounded-3xl sm:p-6"
          >
            <div className="space-y-2 sm:space-y-3">
              {cap.badge && (
                <span className="bg-primary/10 text-primary inline-block rounded-full px-2.5 py-0.5 text-[10px] font-semibold">
                  {cap.badge}
                </span>
              )}
              <h3 className="text-foreground text-base font-bold sm:text-lg">
                {cap.title}
              </h3>
              <p className="text-muted-foreground text-xs leading-relaxed sm:text-sm">
                {cap.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
