'use client'

import { PHILOSOPHY_FEATURES } from '@/constants/pricing-philosophy'

import { SectionHeader } from '../SectionHeader'
import { FeatureDisplay } from './_components/FeatureDisplay'

export function PricingPhilosophySection() {
  return (
    <FeatureDisplay
      isLeft={false}
      imageUrl="/images/landing/landing-pricing.jpeg"
      sectionHeader={
        <SectionHeader
          className="max-w-lg text-white"
          title="โมเดลราคาและแพ็กเกจที่เข้าใจคนทำธุรกิจ เติบโตไปพร้อมกับยอดขายของคุณ"
          description="ในฐานะนักพัฒนา เราเข้าใจดีว่าช่วงเริ่มต้นธุรกิจนั้นยากแค่ไหน เราจึงออกแบบระบบที่ให้คุณหายใจได้ ไม่ต้องแบกรับค่าเช่าหากยังไม่มีออเดอร์"
        />
      }
      featuresList={PHILOSOPHY_FEATURES}
    />
  )
}
