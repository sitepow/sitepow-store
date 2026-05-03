import { PAYMENTS_FEATURES } from '@/constants/payment'

import { SectionContainer } from '../SectionContainer'
import { SectionHeader } from '../SectionHeader'
import { FeatureCard } from './_components/FeatureCard'

export function PaymentSection() {
  return (
    <SectionContainer>
      <SectionHeader
        title={
          <>
            <span className="text-primary">รับเงิน</span> เข้าร้านค้าโดยตรง
            ด้วยระบบ <span className="text-primary">QR PromptPay</span> และ GB
            Prime Pay
          </>
        }
        description="Sitepow ช่วยให้คุณรับเงินได้ทันใจผ่านผู้ให้บริการชั้นนำในไทย
        เงินเข้าบัญชีร้านโดยตรง ไม่ต้องผ่านคนกลาง พร้อมระบบเช็คสลิปอัตโนมัติ"
      />

      <div className="grid w-full gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {PAYMENTS_FEATURES.map((feature, idx) => {
          return <FeatureCard key={idx} {...feature} />
        })}
      </div>
    </SectionContainer>
  )
}
