import { COMMON_FEATURES, PRICING_PLANS } from '@/constants/billing/pricing'

import { SectionContainer } from '@/components/SectionContainer'
import { SectionHeader } from '@/components/SectionHeader'
import { Card, CardContent } from '@/components/ui/card'

import { PricingCard } from './PricingCard'

export function PricingPackages() {
  return (
    <>
      <SectionContainer>
        <div className="grid w-full gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {PRICING_PLANS.map((plan) => (
            <PricingCard key={plan.title} {...plan} />
          ))}
        </div>
      </SectionContainer>
      <SectionContainer>
        <SectionHeader title="ฟีเจอร์ที่ทุกแพ็กเกจได้รับเหมือนกัน" />
        <Card className="mt-5 w-full">
          <CardContent>
            <ul
              role="list"
              className="grid w-full grid-cols-1 gap-4 text-start sm:grid-cols-2 lg:grid-cols-3"
            >
              {COMMON_FEATURES.map((feature, index) => (
                <li key={index} className="flex items-center gap-2 text-sm">
                  <div className="text-primary shrink-0" aria-hidden="true">
                    {feature.icon}
                  </div>
                  <span>{feature.text}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </SectionContainer>
    </>
  )
}
