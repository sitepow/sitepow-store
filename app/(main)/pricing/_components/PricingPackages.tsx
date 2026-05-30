import { PRICING_PLANS } from '@/constants/pricing'

import { SectionContainer } from '@/components/SectionContainer'

import { PricingCard } from './PricingCard'

export function PricingPackages() {
  return (
    <SectionContainer>
      <div className="grid w-full gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {PRICING_PLANS.map((plan) => (
          <PricingCard key={plan.title} {...plan} />
        ))}
      </div>
    </SectionContainer>
  )
}
