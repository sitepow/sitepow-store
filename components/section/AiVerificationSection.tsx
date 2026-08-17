'use client'

import { AI_VERIFICATION_FEATURES } from '@/constants/aiVerification'

import { SectionHeader } from '../SectionHeader'
import { FeatureDisplay } from './_components/FeatureDisplay'

export function AiVerificationSection() {
  return (
    <FeatureDisplay
      isLeft={true}
      imageUrl="/images/landing/landing-ai-slip.avif"
      sectionHeader={
        <SectionHeader
          className="max-w-lg text-white"
          title="ทำงานอัตโนมัติด้วย AI ตรวจสลิปกันโกง & ตอบแชท 24 ชม."
          description="ลดงานแอดมินและเพิ่มความปลอดภัยสูงสุด ด้วยระบบ AI ตรวจสอบสลิปโอนเงินอัตโนมัติ ป้องกันสลิปปลอม พร้อมผู้ช่วย AI ช่วยดูแลและตอบแชทลูกค้าตลอดเวลา"
        />
      }
      featuresList={AI_VERIFICATION_FEATURES}
    />
  )
}
