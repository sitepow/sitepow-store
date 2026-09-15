'use client'
import { useTranslations } from 'next-intl'
import Link from 'next/link'

import { PRICING_OPTIONS } from '@/constants/pricing'
import { useIsMounted } from '@/hooks/use-is-mounted'
import { IconPackage, IconServer } from '@tabler/icons-react'

import { MainHeroHeader } from '../../_components/MainHeroHeader'
import { usePricingStore } from '../store'

export function PricingHeroSection() {
  const isMounted = useIsMounted()
  const t = useTranslations('pricing')
  const tBuyout = useTranslations('buyout.hero')
  const { selectedTab, setSelectedTab } = usePricingStore()
  const titleStart =
    (t.raw('hero.titleStart') as string) || 'เลือก Package ที่เหมาะกับ'
  const titleGradient =
    (t.raw('hero.titleGradient') as string) || 'ขนาดร้านค้าและธุรกิจของคุณ'

  return (
    <MainHeroHeader
      badgeIcon={<IconPackage className="size-4" />}
      badgeText={t('hero.badge')}
      title={
        <>
          {titleStart}{' '}
          <span className="from-primary bg-linear-to-r via-orange-500 to-amber-500 bg-clip-text text-transparent drop-shadow-xs">
            {titleGradient}
          </span>
        </>
      }
      description={t('hero.description')}
    >
      {isMounted && (
        <div className="space-y-3.5 pt-1 sm:space-y-4 sm:pt-2">
          {/* Mode switch: Monthly vs Buyout */}
          <div className="flex justify-center">
            <div className="bg-muted/70 border-border/80 inline-flex max-w-full flex-wrap items-center justify-center gap-1 rounded-xl border p-1 shadow-xs sm:rounded-2xl sm:p-1.5">
              <div className="bg-background text-foreground flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold shadow-sm sm:rounded-xl sm:px-4 sm:py-2 sm:text-sm">
                <IconPackage className="text-primary size-4" />
                <span>{tBuyout('switchToMonthly')}</span>
              </div>
              <Link
                href="/pricing/buyout"
                className="text-muted-foreground hover:text-foreground flex cursor-pointer items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all sm:rounded-xl sm:px-4 sm:py-2 sm:text-sm"
              >
                <IconServer className="size-4" />
                <span>{tBuyout('switchToBuyout')}</span>
                <span className="rounded-full bg-emerald-500/15 px-1.5 py-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                  Hot
                </span>
              </Link>
            </div>
          </div>

          {/* Billing period switcher */}
          <div className="flex justify-center">
            <div className="bg-muted/70 border-border/80 inline-flex max-w-full flex-wrap items-center justify-center gap-0.5 rounded-xl border p-1 shadow-xs sm:gap-1 sm:rounded-2xl sm:p-1.5">
              {PRICING_OPTIONS.map((opt) => {
                const isSelected = selectedTab === opt.value
                const label =
                  (t.raw(`tabs.${opt.value}`) as string) || opt.label
                return (
                  <button
                    key={opt.value}
                    onClick={() => setSelectedTab(opt.value)}
                    className={`flex cursor-pointer items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-all duration-200 sm:gap-1.5 sm:rounded-xl sm:px-3.5 sm:py-2 sm:text-sm ${
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
        </div>
      )}
    </MainHeroHeader>
  )
}
