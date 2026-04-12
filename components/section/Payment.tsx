import { PAYMENTS_FEATURES } from '@/constants/payment'

import { SectionContainer } from '../SectionContainer'
import { FeatureCard } from './_components/FeatureCard'

export function PaymentSection() {
  return (
    <SectionContainer>
      <h2 className="max-w-2xl text-4xl leading-tight font-bold">
        <span className="text-primary">รับเงิน</span> เข้าร้านค้าโดยตรงผ่าน
        Stripe หรือจะรับผ่าน รูปแบบการโอนก็ได้
      </h2>
      <p className="max-w-4xl text-2xl font-medium opacity-70">
        Sitepow เชื่อมต่อเข้ากับผู้ให้บริการรับชำระเงินชั้นนำ
        รองรับการรับชำระเงินได้จากหลากหลายช่องทาง
      </p>

      <div className="grid w-full grid-cols-2 gap-5">
        {PAYMENTS_FEATURES.map((feature, idx) => {
          return <FeatureCard key={idx} {...feature} />
        })}
      </div>
    </SectionContainer>
  )
}
