'use client'

import { MerchantLayout } from '@/app/sites/[domain]/_components/layout/admin/MerchantLayout'

import { AiUsageContent } from '../_components/AiUsageContent'

export default function MerchantAiUsagePage() {
  return (
    <MerchantLayout>
      <AiUsageContent />
    </MerchantLayout>
  )
}
