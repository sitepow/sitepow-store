'use client'

import { useTranslations } from 'next-intl'

import { usePricingStore } from '@/app/(main)/pricing/store'
import { PRICING_OPTIONS } from '@/constants/pricing'
import { RESPONSIVE_DEVICE } from '@/constants/system'
import { useIsMounted } from '@/hooks/use-is-mounted'
import { useMediaQuery } from '@/hooks/use-media-query'

import { Badge } from '@/components/ui/badge'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'

const TAB_STYLE = {
  tabslist_mobile:
    'flex h-auto w-full shrink-0 items-stretch justify-start gap-1 rounded-xl border p-1 xl:sticky xl:top-5 xl:w-57.5 xl:flex-col',
  tabs_mobile: 'flex flex-col gap-6 xl:flex-row',
}

export function MerchantPricingTabs() {
  const t = useTranslations('pricing.tabs')
  const isMounted = useIsMounted()
  const isDesktop = useMediaQuery(`(min-width: ${RESPONSIVE_DEVICE.desktop})`)
  const { selectedTab, setSelectedTab } = usePricingStore()

  if (!isMounted) {
    return null
  }

  return (
    <Tabs
      value={selectedTab}
      onValueChange={setSelectedTab}
      orientation={isDesktop ? 'horizontal' : 'vertical'}
      className={isDesktop ? '' : TAB_STYLE.tabs_mobile}
    >
      <TabsList className={isDesktop ? '' : TAB_STYLE.tabslist_mobile}>
        {PRICING_OPTIONS.map((plan) => {
          const label = t.raw(plan.value) as string

          return (
            <TabsTrigger className="px-5" key={plan.value} value={plan.value}>
              {label}
              {plan?.discountPercent !== 0 && (
                <Badge>
                  {t('discountBadge', { percent: plan.discountPercent ?? 0 })}
                </Badge>
              )}
            </TabsTrigger>
          )
        })}
      </TabsList>
    </Tabs>
  )
}
