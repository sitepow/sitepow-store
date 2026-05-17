'use client'

import { MerchantLayout } from '@/app/sites/[domain]/_components/layout/admin/MerchantLayout'

import { DashboardContent } from '../_components/DashboardContent'

export default function MerchantDashboardPage() {
  return (
    <MerchantLayout>
      <DashboardContent />
    </MerchantLayout>
  )
}
