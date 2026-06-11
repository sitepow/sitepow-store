import { NAVBAR_ITEMS } from '@/constants/navbar'

import { SectionContainer } from '../SectionContainer'
import { SectionHeader } from '../SectionHeader'
import { FeatureCard } from './_components/FeatureCard'

export function FeatureSection() {
  const featuresList =
    NAVBAR_ITEMS.find((item) => item.href === '/features')?.children || []

  return (
    <SectionContainer>
      <SectionHeader
        title={
          <>
            <span className="text-primary">รับ และ จัดการออเดอร์</span> ทั้งหมด
            ในที่เดียว ลดความซ้ำซ้อน ลดงาน ลดเอกสาร
          </>
        }
        description="รับออเดอร์ได้จากทุกช่องทางการขาย พร้อมระบบการจัดการขายที่ใช้งานง่าย
        เพื่อให้คุณได้โฟกัสการขายสินค้าได้อย่างเต็มที่"
      />

      <div className="grid w-full gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {featuresList.map((feature, idx) => {
          return <FeatureCard key={idx} {...feature} />
        })}
      </div>
    </SectionContainer>
  )
}
