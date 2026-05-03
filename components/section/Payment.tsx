import { PAYMENTS_FEATURES } from '@/constants/payment'

import { SectionContainer } from '../SectionContainer'
import { FeatureCard } from './_components/FeatureCard'

export function PaymentSection() {
  return (
    <SectionContainer>
      <h2 className="max-w-2xl text-4xl leading-tight font-bold">
        <span className="text-primary">รับเงิน</span> เข้าร้านค้าโดยตรง ด้วยระบบ{' '}
        <span className="text-primary">QR PromptPay</span> และ GB Prime Pay
      </h2>
      <p className="max-w-4xl text-2xl font-medium opacity-70">
        Sitepow ช่วยให้คุณรับเงินได้ทันใจผ่านผู้ให้บริการชั้นนำในไทย
        เงินเข้าบัญชีร้านโดยตรง ไม่ต้องผ่านคนกลาง พร้อมระบบเช็คสลิปอัตโนมัติ
      </p>

      <div className="grid w-full grid-cols-3 gap-5">
        {PAYMENTS_FEATURES.map((feature, idx) => {
          return <FeatureCard key={idx} {...feature} />
        })}
      </div>
    </SectionContainer>
  )
}
