'use client'

import { BUYOUT_PLANS } from '@/constants/buyout'

import { BuyoutCard } from './BuyoutCard'

export function BuyoutPackages() {
  return (
    <section className="relative mx-auto w-full max-w-7xl space-y-12 px-3.5 sm:px-6 lg:px-8">
      <div
        aria-hidden="true"
        className="from-primary/15 pointer-events-none absolute top-20 left-1/2 -z-10 h-96 w-full max-w-5xl -translate-x-1/2 rounded-full bg-linear-to-r via-orange-500/10 to-transparent blur-3xl"
      />

      <div className="grid w-full items-stretch gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {BUYOUT_PLANS.map((plan, idx) => (
          <BuyoutCard key={plan.id} plan={plan} planIndex={idx} />
        ))}
      </div>
    </section>
  )
}
