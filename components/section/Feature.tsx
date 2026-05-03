import { NAVBAR_ITEMS } from '@/constants/navbar'

import { SectionContainer } from '../SectionContainer'
import { FeatureCard } from './_components/FeatureCard'

export function FeatureSection() {
  const featuresList =
    NAVBAR_ITEMS.find((item) => item.href === '/features')?.children || []

  return (
    <SectionContainer>
      <h2 className="max-w-2xl text-4xl leading-tight font-bold">
        <span className="text-primary">รับ และ จัดการออเดอร์</span> ทั้งหมด
        ในที่เดียว ลดความซ้ำซ้อน ลดงาน ลดเอกสาร
      </h2>
      <p className="max-w-4xl text-2xl font-medium opacity-70">
        รับออเดอร์ได้จากทุกช่องทางการขาย พร้อมระบบการจัดการขายที่ใช้งานง่าย
        เพื่อให้คุณได้โฟกัสการขายสินค้าได้อย่างเต็มที่
      </p>

      <div className="grid w-full grid-cols-2 gap-5">
        {featuresList.map((feature, idx) => {
          return <FeatureCard key={idx} {...feature} />
        })}
      </div>
    </SectionContainer>
  )
}
