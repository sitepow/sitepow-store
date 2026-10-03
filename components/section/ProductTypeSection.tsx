'use client'


import { PRODUCT_TYPE_FEATURES } from '@/constants/product-types'

import { SectionHeader } from '../SectionHeader'
import { FeatureDisplay } from './_components/FeatureDisplay'

export function ProductTypeSection() {
  return (
    <FeatureDisplay
      isLeft={false}
      imageUrl="/images/landing/landing-product-type.jpeg"
      sectionHeader={
        <SectionHeader
          className="max-w-lg text-white"
          title="รองรับทุกโมเดลธุรกิจ ไม่ว่าคุณจะขายของแบบไหน"
          description="เราออกแบบระบบมาให้ยืดหยุ่นที่สุด รองรับทั้งสินค้าหน้าร้านและสินค้าดิจิทัลทุกรูปแบบ เพื่อให้คุณโฟกัสกับการขายได้โดยไม่ต้องเปลี่ยนระบบไปมา"
        />
      }
      featuresList={PRODUCT_TYPE_FEATURES}
    />
  )
}
