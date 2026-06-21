'use client'

import { PHILOSOPHY_FEATURES } from '@/constants/pricing-philosophy'

import { SectionHeader } from '../SectionHeader'
import { FeatureDisplay } from './_components/FeatureDisplay'

export function PricingPhilosophySection() {
  return (
    <FeatureDisplay
      isLeft={false}
      imageUrl="https://images.unsplash.com/photo-1518837695005-2083093ee35b?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
      sectionHeader={
        <SectionHeader
          className="max-w-lg text-white"
          title="โมเดลราคาที่ เข้าใจคนทำธุรกิจ เราเติบโตไปพร้อมกับยอดขายของคุณ"
          description="ในฐานะนักพัฒนา เราเข้าใจดีว่าช่วงเริ่มต้นธุรกิจนั้นยากแค่ไหน เราจึงออกแบบระบบที่ให้คุณหายใจได้ ไม่ต้องแบกรับค่าเช่าหากยังไม่มีออเดอร์"
        />
      }
      featuresList={PHILOSOPHY_FEATURES}
    />
  )
}
