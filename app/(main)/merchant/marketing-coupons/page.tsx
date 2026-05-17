'use client'

import { MerchantLayout } from '@/app/sites/[domain]/_components/layout/admin/MerchantLayout'

import { MarketingCouponsContent } from '../_components/MarketingCouponsContent'

export default function MerchantMarketingCouponsPage() {
  return (
    <MerchantLayout>
      <MarketingCouponsContent />
    </MerchantLayout>
  )
}
