import { PRICING_PLANS } from '@/constants/pricing'

import { PricingCard } from './PricingCard'

export function PricingPackages() {
  return (
    <div className="grid w-full grid-cols-3 gap-5">
      {PRICING_PLANS.map((plan) => (
        <PricingCard key={plan.title} {...plan} />
      ))}
    </div>
  )
}
