'use client'

import { PRICING_OPTIONS } from '@/constants/pricing'

import { Badge } from '@/components/ui/badge'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'

import { usePricingStore } from '../store'

export function PricingTabs() {
  const { selectedTab, setSelectedTab } = usePricingStore()

  return (
    <Tabs value={selectedTab} onValueChange={setSelectedTab}>
      <TabsList>
        {PRICING_OPTIONS.map((plan) => {
          return (
            <TabsTrigger className="px-5" key={plan.value} value={plan.value}>
              {plan.label}
              {plan.discount && <Badge>{plan.discount}</Badge>}
            </TabsTrigger>
          )
        })}
      </TabsList>
    </Tabs>
  )
}
