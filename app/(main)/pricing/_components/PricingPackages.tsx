import { PRICING_PLANS } from '@/constants/pricing'

import { SectionContainer } from '@/components/SectionContainer'

import { PricingCard } from './PricingCard'

export function PricingPackages() {
  return (
    <SectionContainer>
      <div className="grid w-full grid-cols-3 gap-5">
        {PRICING_PLANS.map((plan) => (
          <PricingCard key={plan.title} {...plan} />
        ))}
      </div>
    </SectionContainer>
  )
}
