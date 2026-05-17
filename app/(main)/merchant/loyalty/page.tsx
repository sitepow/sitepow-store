'use client'

import { MerchantLayout } from '@/app/sites/[domain]/_components/layout/admin/MerchantLayout'

import { LoyaltyContent } from '../_components/LoyaltyContent'

export default function MerchantLoyaltyPage() {
  return (
    <MerchantLayout>
      <LoyaltyContent />
    </MerchantLayout>
  )
}
