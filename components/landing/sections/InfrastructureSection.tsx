'use client'


import { INFRASTRUCTURE_FEATURES } from '@/constants/landing/sections/infrastructure'

import { SectionHeader } from '@/components/layout/SectionHeader'
import { FeatureDisplay } from '../_components/FeatureDisplay'

export function InfrastructureSection() {
  return (
    <FeatureDisplay
      isLeft={false}
      imageUrl="/images/landing/landing-cloud.jpeg"
      sectionHeader={
        <SectionHeader
          className="max-w-lg text-white"
          title="โครงสร้างพื้นฐาน ระดับ Enterprise ที่คุณวางใจได้"
          description="Sitepow รันบน Infrastructure ที่ออกแบบมาเพื่อธุรกิจโดยเฉพาะ ด้วย CPU AMD EPYC™ จาก ReadyIDC และ Stack เทคโนโลยีทันสมัย มั่นใจได้ว่าร้านค้าของคุณพร้อมรับลูกค้าได้ตลอด 24 ชั่วโมง"
        />
      }
      featuresList={INFRASTRUCTURE_FEATURES}
    />
  )
}
