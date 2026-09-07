'use client'
import { useTranslations } from 'next-intl'

import { PRICING_OPTIONS } from '@/constants/pricing'
import { useIsMounted } from '@/hooks/use-is-mounted'
import { IconPackage } from '@tabler/icons-react'

import { MainHeroHeader } from '../../_components/MainHeroHeader'
import { usePricingStore } from '../store'

export function PricingHeroSection() {
  const isMounted = useIsMounted()
  const t = useTranslations('pricing')
  const { selectedTab, setSelectedTab } = usePricingStore()
  return (
    <MainHeroHeader
      badgeIcon={<IconPackage className="size-4" />}
      badgeText={t('hero.badge')}
      title={
        (t.raw('hero.title') as string) ||
        'เลือก Package ที่เหมาะกับ ขนาดร้านค้าและธุรกิจของคุณ'
      }
      description={t('hero.description')}
    >
      {isMounted && (
        <div className="flex justify-center pt-2">
          <div className="bg-muted/70 border-border/80 inline-flex max-w-full flex-wrap items-center justify-center gap-1 rounded-2xl border p-1.5 shadow-xs">
            {PRICING_OPTIONS.map((opt) => {
              const isSelected = selectedTab === opt.value
              const label = (t.raw(`tabs.${opt.value}`) as string) || opt.label
              return (
                <button
                  key={opt.value}
                  onClick={() => setSelectedTab(opt.value)}
                  className={`flex cursor-pointer items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-semibold transition-all duration-200 sm:text-sm ${
                    isSelected
                      ? 'bg-background text-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <span>{label}</span>
                  {(opt.discountPercent ?? 0) > 0 && (
                    <span className="rounded-full bg-emerald-500/15 px-1.5 py-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                      {t('tabs.discountBadge', {
                        percent: opt.discountPercent ?? 0,
                      })}
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        </div>
      )}
    </MainHeroHeader>
  )
}
