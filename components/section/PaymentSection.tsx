'use client'

import { PAYMENTS_FEATURES } from '@/constants/payment'

import { SectionHeader } from '../SectionHeader'
import { FeatureDisplay } from './_components/FeatureDisplay'

export function PaymentSection() {
  return (
    <FeatureDisplay
      imageUrl="https://images.unsplash.com/photo-1654895169143-75bf26433636?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
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
