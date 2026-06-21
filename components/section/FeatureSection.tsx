'use client'

import { NAVBAR_ITEMS } from '@/constants/navbar'

import { SectionHeader } from '../SectionHeader'
import { FeatureDisplay } from './_components/FeatureDisplay'

export function FeatureSection() {
  const featuresList =
    NAVBAR_ITEMS.find((item) => item.href === '/features')?.children || []

  return (
    <FeatureDisplay
      imageUrl="https://images.unsplash.com/photo-1601388152430-4ad0f14c0788?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
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
