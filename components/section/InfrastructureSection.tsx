import { INFRASTRUCTURE_FEATURES } from '@/constants/infrastructure'

import { SectionContainer } from '../SectionContainer'
import { SectionHeader } from '../SectionHeader'
import { FeatureCard } from './_components/FeatureCard'

export function InfrastructureSection() {
  return (
    <SectionContainer>
      <SectionHeader
        title={
          <>
            โครงสร้างพื้นฐาน{' '}
            <span className="text-primary">ระดับ Enterprise</span>
            <br />
            ที่คุณ<span className="text-primary">วางใจได้</span>
          </>
        }
        description="Sitepow รันบน Infrastructure ที่ออกแบบมาเพื่อธุรกิจโดยเฉพาะ
        ด้วย CPU AMD EPYC™ จาก ReadyIDC และ Stack เทคโนโลยีทันสมัย
        มั่นใจได้ว่าร้านค้าของคุณพร้อมรับลูกค้าได้ตลอด 24 ชั่วโมง"
      />

      <div className="grid w-full gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {INFRASTRUCTURE_FEATURES.map((feature, idx) => (
          <FeatureCard key={idx} {...feature} />
        ))}
      </div>
    </SectionContainer>
  )
}
