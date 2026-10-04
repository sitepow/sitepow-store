'use client'


import { CHAT_FEATURES } from '@/constants/landing/sections/chat'

import { SectionHeader } from '@/components/layout/SectionHeader'
import { FeatureDisplay } from '../_components/FeatureDisplay'

export function ChatSection() {
  return (
    <FeatureDisplay
      isLeft={false}
      imageUrl="/images/landing/landing-chat.jpeg"
      sectionHeader={
        <SectionHeader
          className="max-w-lg text-white"
          title="เชื่อมต่อและดูแลลูกค้าไร้รอยต่อ ด้วยระบบแชทในตัว"
          description="บริหารข้อความสนทนา ทั้งแชทซื้อขายและงานบริการหลังการขาย ดึงทีมงานร่วมดูแล พร้อม AI ผู้ช่วยตอบแชทคอยดูแลลูกค้าของคุณตลอด 24 ชั่วโมง"
        />
      }
      featuresList={CHAT_FEATURES}
    />
  )
}
