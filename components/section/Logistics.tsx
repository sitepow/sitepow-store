import { LOGISTICS_FEATURES } from '@/constants/logistics'

import { SectionContainer } from '../SectionContainer'
import { FeatureCard } from './_components/FeatureCard'

export function LogisticsSection() {
  return (
    <SectionContainer>
      <h2 className="max-w-2xl text-4xl leading-tight font-bold">
        <span className="text-primary">จัดการขนส่ง</span> ได้ง่ายกว่าที่เคย
        ด้วยระบบ <span className="text-primary">อัตโนมัติ</span> ครบวงจร
      </h2>
      <p className="max-w-4xl text-2xl font-medium opacity-70">
        Sitepow เชื่อมต่อกับผู้ให้บริการขนส่งชั้นนำ ช่วยให้คุณจัดการออเดอร์
        คำนวณค่าส่ง และแจ้งเลขพัสดุได้ในที่เดียว
        ประหยัดเวลาแพ็คและส่งของได้มากกว่า 50%
      </p>

      <div className="grid w-full grid-cols-2 gap-5">
        {LOGISTICS_FEATURES.map((feature, idx) => {
          return <FeatureCard key={idx} {...feature} />
        })}
      </div>
    </SectionContainer>
  )
}
