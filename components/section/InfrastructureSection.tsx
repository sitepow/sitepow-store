'use client'

import { INFRASTRUCTURE_FEATURES } from '@/constants/infrastructure'

import { SectionHeader } from '../SectionHeader'
import { FeatureDisplay } from './_components/FeatureDisplay'

export function InfrastructureSection() {
  return (
    <FeatureDisplay
      imageUrl="https://images.unsplash.com/photo-1601370552761-d129028bd833?q=80&w=1167&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
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
