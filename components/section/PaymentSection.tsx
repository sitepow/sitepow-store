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
            <span className="text-primary">รับเงินไว</span> เงินเข้าบัญชีโดยตรง
            <br className="hidden md:block" />
            ด้วยระบบ <span className="text-primary">QR PromptPay</span>{' '}
            และโอนผ่านธนาคาร
          </>
        }
        description="เริ่มขายได้ทันทีไม่ต้องรออนุมัติ! รับเงินเข้าบัญชีร้านค้าโดยตรง ไม่ต้องผ่านคนกลาง พร้อมระบบเช็คสลิปอัตโนมัติที่ช่วยให้คุณทำงานง่ายขึ้น"
      />

      <div className="grid w-full gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {PAYMENTS_FEATURES.map((feature, idx) => {
          return <FeatureCard key={idx} {...feature} />
        })}
      </div>
    </SectionContainer>
  )
}
