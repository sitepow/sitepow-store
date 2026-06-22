'use client'

import { SECURITY_FEATURES } from '@/constants/security-trust'

import { SectionHeader } from '../SectionHeader'
import { FeatureDisplay } from './_components/FeatureDisplay'

export function SecurityTrustSection() {
  return (
    <FeatureDisplay
      isLeft={false}
      imageUrl="/images/landing/landing-security.png"
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
