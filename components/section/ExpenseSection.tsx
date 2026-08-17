'use client'

import { EXPENSE_FEATURES } from '@/constants/expenses'

import { SectionHeader } from '../SectionHeader'
import { FeatureDisplay } from './_components/FeatureDisplay'

export function ExpenseSection() {
  return (
    <FeatureDisplay
      isLeft={true}
      imageUrl="/images/landing/landing-expense.jpeg"
      sectionHeader={
        <SectionHeader
          className="max-w-lg text-white"
          title="บันทึกและบริหารค่าใช้จ่ายร้านค้า ครบจบในระบบเดียว"
          description="หมดปัญหาเรื่องบัญชีชีวต ควบคุมทุกรายจ่ายของร้านค้า จัดหมวดหมู่ง่าย แนบใบเสร็จได้ และสรุปผลกำไรสุทธิที่แท้จริงให้คุณทันที"
        />
      }
      featuresList={EXPENSE_FEATURES}
    />
  )
}
