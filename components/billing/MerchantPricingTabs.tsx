'use client'

import { usePricingStore } from '@/stores/billing/use-pricing-store'
import { PRICING_OPTIONS } from '@/constants/billing/pricing'
import { RESPONSIVE_DEVICE } from '@/constants/system'
import { useIsMounted } from '@/hooks/use-is-mounted'
import { useMediaQuery } from '@/hooks/use-media-query'

import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

const TAB_STYLE = {
  tabslist_mobile:
    'flex h-auto w-full shrink-0 items-stretch justify-start gap-1 rounded-xl border p-1 xl:sticky xl:top-5 xl:w-57.5 xl:flex-col',
  tabs_mobile: 'flex flex-col gap-6 xl:flex-row',
}

export function MerchantPricingTabs() {
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
          return (
            <TabsTrigger className="px-5" key={plan.value} value={plan.value}>
              {plan.label}
              {plan?.discountPercent !== 0 && (
                <Badge>ลด {plan.discountPercent}%</Badge>
              )}
            </TabsTrigger>
          )
        })}
      </TabsList>
      {PRICING_OPTIONS.map((plan) => (
        <TabsContent
          key={plan.value}
          value={plan.value}
          className="sr-only"
          tabIndex={-1}
        >
          <span className="sr-only">{plan.label}</span>
        </TabsContent>
      ))}
    </Tabs>
  )
}
