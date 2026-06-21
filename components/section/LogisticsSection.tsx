'use client'

import { LOGISTICS_FEATURES } from '@/constants/logistics'

import { SectionHeader } from '../SectionHeader'
import { FeatureDisplay } from './_components/FeatureDisplay'

export function LogisticsSection() {
  return (
    <FeatureDisplay
      isLeft={false}
      imageUrl="/images/landing/landing-product-boxs.jpeg"
      sectionHeader={
        <SectionHeader
          className="max-w-lg text-white"
          title="จัดการขนส่ง ได้ง่ายกว่าที่เคย ด้วยระบบ อัตโนมัติ ครบวงจร"
          description="เชื่อมต่อกับผู้ให้บริการขนส่งชั้นนำ ช่วยให้คุณจัดการออเดอร์ คำนวณค่าส่ง และแจ้งเลขพัสดุได้ในที่เดียว ประหยัดเวลาแพ็คและส่งของได้มากกว่า 50%"
        />
      }
      featuresList={LOGISTICS_FEATURES}
    />
  )
}
