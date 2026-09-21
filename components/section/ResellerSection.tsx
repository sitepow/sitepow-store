'use client'

import { RESELLER_FEATURES } from '@/constants/reseller'

import { SectionHeader } from '../SectionHeader'
import { FeatureDisplay } from './_components/FeatureDisplay'

export function ResellerSection() {
  return (
    <FeatureDisplay
      isLeft={true}
      imageUrl="/images/landing/landing-reseller.jpeg"
      sectionHeader={
        <SectionHeader
          className="max-w-lg text-white"
          title="ขยายธุรกิจด้วยระบบตัวแทนจำหน่าย & B2B ในตัว"
          description="บริหารเครือข่ายตัวแทนจำหน่ายและราคาส่งได้อย่างมืออาชีพ ทำสัญญา กำหนดราคาส่งเฉพาะรายบุคคล และตัดสต็อกออเดอร์ขายส่งได้ในระบบเดียว"
        />
      }
      featuresList={RESELLER_FEATURES}
    />
  )
}
