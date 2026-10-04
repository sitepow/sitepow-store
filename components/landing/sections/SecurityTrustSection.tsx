'use client'


import { SECURITY_FEATURES } from '@/constants/landing/sections/security'

import { SectionHeader } from '@/components/layout/SectionHeader'
import { FeatureDisplay } from '../_components/FeatureDisplay'

export function SecurityTrustSection() {
  return (
    <FeatureDisplay
      isLeft={true}
      imageUrl="/images/landing/landing-security.jpeg"
      sectionHeader={
        <SectionHeader
          className="max-w-lg text-white"
          title="ปลอดภัยกว่า มั่นใจได้มากกว่า การเป็นเจ้าของธุรกิจไม่ต้องเสี่ยงกับซอฟต์แวร์เถื่อน"
          description="เราเปลี่ยนความเสี่ยงจากช่องโหว่ของโปรแกรม Crack มาเป็นระบบ SaaS ที่ถูกออกแบบมาเพื่อปกป้องธุรกิจของคุณโดยเฉพาะ"
        />
      }
      featuresList={SECURITY_FEATURES}
    />
  )
}
