'use client'
import { useTranslations } from 'next-intl'

import { FeatureWorkflowStep } from '@/constants/features'

import { MainSectionHeader } from '../../../_components/MainSectionHeader'

export function FeatureWorkflowSection({
  workflow,
}: {
  workflow: FeatureWorkflowStep[]
}) {
  const t = useTranslations('features.detail.workflow')
  return (
    <div className="mx-auto w-full max-w-7xl space-y-4 px-3.5 sm:space-y-8 sm:px-6 lg:px-8">
      <MainSectionHeader
        badge={t('badge')}
        title={t('title')}
        description={t('description')}
      />
      <div className="grid grid-cols-1 gap-3.5 sm:gap-6 md:grid-cols-3">
        {workflow.map((item, wIdx) => (
          <div
            key={wIdx}
            className="bg-card/60 border-border/80 hover:border-border relative flex flex-col justify-between rounded-2xl border p-4 shadow-xs transition-all duration-300 hover:shadow-md sm:rounded-3xl sm:p-6"
          >
            <div className="space-y-2.5 sm:space-y-4">
              <div className="text-primary text-2xl font-black sm:text-3xl">
                {item.step}
              </div>
              <h3 className="text-foreground text-base font-bold sm:text-lg">
                {item.title}
              </h3>
              <p className="text-muted-foreground text-xs leading-relaxed sm:text-sm">
                {item.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
