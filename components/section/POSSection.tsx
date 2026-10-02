'use client'

import { POS_FEATURES } from '@/constants/pos'

import { SectionHeader } from '../SectionHeader'
import { FeatureDisplay } from './_components/FeatureDisplay'

export function POSSection() {
  return (
    <FeatureDisplay
      isLeft={true}
      imageUrl="/images/landing/landing-pos.jpeg"
      sectionHeader={
        <SectionHeader
          className="max-w-lg text-white"
          title="ระบบจัดการออเดอร์หน้าร้านและร้านอาหาร POS"
          description="ไม่ว่าคุณจะมีหน้าร้านจริงหรือเป็นจุดรับสินค้า ระบบ POS ของเราเชื่อมต่อกับสต็อกสินค้าออนไลน์ของคุณโดยตรง ตัดสต็อกอัตโนมัติ ลดปัญหาของไม่ตรงยอด"
        />
      }
      featuresList={POS_FEATURES}
    />
  )
}
