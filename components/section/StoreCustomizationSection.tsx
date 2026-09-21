'use client'

import { CUSTOMIZATION_FEATURES } from '@/constants/store-customization'

import { SectionHeader } from '../SectionHeader'
import { FeatureDisplay } from './_components/FeatureDisplay'

export function StoreCustomizationSection() {
  return (
    <FeatureDisplay
      isLeft={true}
      imageUrl="/images/landing/landing-customization.jpeg"
      sectionHeader={
        <SectionHeader
          className="max-w-lg text-white"
          title="สร้างร้านค้าในสไตล์ที่เป็นคุณ"
          description="ทุกตารางนิ้วบนหน้าร้านค้าของคุณสามารถปรับเปลี่ยนได้ตามตัวตนของแบรนด์ ไม่ว่าจะเป็นภาพ วิดีโอ หรือโทนสี ช่วยให้ร้านค้าของคุณแตกต่างและโดดเด่นกว่าใคร"
        />
      }
      featuresList={CUSTOMIZATION_FEATURES}
    />
  )
}
