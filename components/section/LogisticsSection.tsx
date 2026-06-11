import { LOGISTICS_FEATURES } from '@/constants/logistics'

import { SectionContainer } from '../SectionContainer'
import { SectionHeader } from '../SectionHeader'
import { FeatureCard } from './_components/FeatureCard'

export function LogisticsSection() {
  return (
    <SectionContainer>
      <SectionHeader
        title={
          <>
            <span className="text-primary">จัดการขนส่ง</span> ได้ง่ายกว่าที่เคย
            ด้วยระบบ <span className="text-primary">อัตโนมัติ</span> ครบวงจร
          </>
        }
        description="เชื่อมต่อกับผู้ให้บริการขนส่งชั้นนำ ช่วยให้คุณจัดการออเดอร์
        คำนวณค่าส่ง และแจ้งเลขพัสดุได้ในที่เดียว
        ประหยัดเวลาแพ็คและส่งของได้มากกว่า 50%"
      />

      <div className="grid w-full gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {LOGISTICS_FEATURES.map((feature, idx) => {
          return <FeatureCard key={idx} {...feature} />
        })}
      </div>
    </SectionContainer>
  )
}
