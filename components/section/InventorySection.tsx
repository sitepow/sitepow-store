'use client'

import { INVENTORY_FEATURES } from '@/constants/inventory'

import { SectionHeader } from '../SectionHeader'
import { FeatureDisplay } from './_components/FeatureDisplay'

export function InventorySection() {
  return (
    <FeatureDisplay
      isLeft={true}
      imageUrl="/images/landing/landing-inventory.jpeg"
      sectionHeader={
        <SectionHeader
          className="max-w-lg text-white"
          title="บริหารสต็อกและโอนย้ายสินค้าระหว่างสาขาอย่างสมบูรณ์แบบ"
          description="จัดการคลังสินค้าแบบ Multi-Branch เช็กสต็อกรายสาขา โอนย้ายสินค้า และบันทึกการปรับสต็อกเมื่อชำรุดหรือหมดอายุได้อย่างมีประสิทธิภาพ"
        />
      }
      featuresList={INVENTORY_FEATURES}
    />
  )
}
