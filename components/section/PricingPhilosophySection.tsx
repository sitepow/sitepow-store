import { PHILOSOPHY_FEATURES } from '@/constants/pricing-philosophy'

import { SectionContainer } from '../SectionContainer'
import { SectionHeader } from '../SectionHeader'
import { FeatureCard } from './_components/FeatureCard'

export function PricingPhilosophySection() {
  return (
    <SectionContainer>
      <SectionHeader
        title={
          <>
            โมเดลราคาที่ <span className="text-primary">เข้าใจคนทำธุรกิจ</span>
            <br />
            เราเติบโตไปพร้อมกับยอดขายของคุณ
          </>
        }
        description="ในฐานะนักพัฒนา เราเข้าใจดีว่าช่วงเริ่มต้นธุรกิจนั้นยากแค่ไหน เราจึงออกแบบระบบที่ให้คุณหายใจได้ ไม่ต้องแบกรับค่าเช่าหากยังไม่มีออเดอร์"
      />

      <div className="grid w-full gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {PHILOSOPHY_FEATURES.map((feature, idx) => (
          <FeatureCard key={idx} {...feature} />
        ))}
      </div>
    </SectionContainer>
  )
}
