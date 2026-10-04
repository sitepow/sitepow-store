'use client'


import { INVENTORY_FEATURES } from '@/constants/landing/sections/inventory'

import { SectionHeader } from '@/components/layout/SectionHeader'
import { FeatureDisplay } from '../_components/FeatureDisplay'

export function InventorySection() {
  return (
    <FeatureDisplay
      isLeft={false}
      imageUrl="/images/landing/landing-inventory.jpeg"
      sectionHeader={
        <SectionHeader
          className="max-w-lg text-white"
          title="ระบบสต็อกสินค้าหลายสาขาและจัดการคลัง"
          description="จัดการคลังสินค้าแบบ Multi-Branch เช็กสต็อกรายสาขา โอนย้ายสินค้า และบันทึกการปรับสต็อกเมื่อชำรุดหรือหมดอายุได้อย่างมีประสิทธิภาพ"
        />
      }
      featuresList={INVENTORY_FEATURES}
    />
  )
}
