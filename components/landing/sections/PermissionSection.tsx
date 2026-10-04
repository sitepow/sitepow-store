'use client'


import { PERMISSION_FEATURES } from '@/constants/landing/sections/permission'

import { SectionHeader } from '@/components/layout/SectionHeader'
import { FeatureDisplay } from '../_components/FeatureDisplay'

export function PermissionSection() {
  return (
    <FeatureDisplay
      isLeft={true}
      imageUrl="/images/landing/landing-permission.jpeg"
      sectionHeader={
        <SectionHeader
          className="max-w-lg text-white"
          title="บริหารจัดการสิทธิ์พนักงาน ปลอดภัยระดับ Granular"
          description="ควบคุมการเข้าถึงข้อมูลของทีมงานได้อย่างเด็ดขาด แยกสิทธิ์ตามบทบาทและรายสาขา ช่วยให้การทำงานร่วมกันปลอดภัยและเป็นระบบมากยิ่งขึ้น"
        />
      }
      featuresList={PERMISSION_FEATURES}
    />
  )
}
