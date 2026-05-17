'use client'

import { MerchantLayout } from '@/app/sites/[domain]/_components/layout/admin/MerchantLayout'

import { BillingSubscriptionContent } from '../_components/BillingSubscriptionContent'

export default function MerchantBillingSubscriptionPage() {
  return (
    <MerchantLayout>
      <BillingSubscriptionContent />
    </MerchantLayout>
  )
}
