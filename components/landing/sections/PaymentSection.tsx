'use client'


import { PAYMENTS_FEATURES } from '@/constants/landing/sections/payment'

import { SectionHeader } from '@/components/layout/SectionHeader'
import { FeatureDisplay } from '../_components/FeatureDisplay'

export function PaymentSection() {
  return (
    <FeatureDisplay
      isLeft={false}
      imageUrl="/images/landing/landing-payments.jpeg"
      sectionHeader={
        <SectionHeader
          className="max-w-lg text-white"
          title="รับเงินไว เงินเข้าบัญชีโดยตรง ด้วยระบบ QR PromptPay และโอนผ่านธนาคาร"
          description="เริ่มขายได้ทันทีไม่ต้องรออนุมัติ! รับเงินเข้าบัญชีร้านค้าโดยตรง ไม่ต้องผ่านคนกลาง พร้อมระบบเช็คสลิปอัตโนมัติที่ช่วยให้คุณทำงานง่ายขึ้น"
        />
      }
      featuresList={PAYMENTS_FEATURES}
    />
  )
}
