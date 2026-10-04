'use client'


import { CUSTOMER_LOYALTY_FEATURES } from '@/constants/landing/sections/customer-loyalty'

import { SectionHeader } from '../SectionHeader'
import { FeatureDisplay } from './_components/FeatureDisplay'

export function CustomerLoyaltySection() {
  return (
    <FeatureDisplay
      isLeft={false}
      imageUrl="/images/landing/landing-loyalty.jpeg"
      sectionHeader={
        <SectionHeader
          className="max-w-lg text-white"
          title="มัดใจลูกค้าให้อยู่หมัด ด้วยระบบสะสมแต้ม & เปลี่ยนรีวิวเป็นยอดขาย"
          description="สร้างฐานลูกค้าประจำด้วยระบบสมาชิก สะสมคะแนน คูปองโปรโมชัน และระบบแจกแต้มอัจฉริยะเมื่อลูกค้าเขียนรีวิวพร้อมรูปภาพหรือวิดีโอ"
        />
      }
      featuresList={CUSTOMER_LOYALTY_FEATURES}
    />
  )
}
