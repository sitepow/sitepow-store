'use client'


import { NAVBAR_ITEMS } from '@/constants/landing/navbar'

import { SectionHeader } from '@/components/layout/SectionHeader'
import { FeatureDisplay } from '../_components/FeatureDisplay'

export function FeatureSection() {
  const featuresList =
    NAVBAR_ITEMS.find((item) => item.href === '/features')?.children || []

  return (
    <FeatureDisplay
      defaultActive
      imageUrl="/images/landing/landing-orders-managers.jpeg"
      sectionHeader={
        <SectionHeader
          className="max-w-lg text-white"
          title="รับ และ จัดการออเดอร์ ทั้งหมดในที่เดียว ลดความซ้ำซ้อน ลดงาน ลดเอกสาร"
          description="รับออเดอร์ได้จากทุกช่องทางการขาย พร้อมระบบการจัดการขายที่ใช้งานง่าย
        เพื่อให้คุณได้โฟกัสการขายสินค้าได้อย่างเต็มที่"
        />
      }
      featuresList={featuresList}
    />
  )
}
