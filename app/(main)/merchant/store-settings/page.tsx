'use client'

import { MerchantLayout } from '@/app/sites/[domain]/_components/layout/admin/MerchantLayout'

import { StoreSettingsContent } from '../_components/StoreSettingsContent'

export default function MerchantStoreSettingsPage() {
  return (
    <MerchantLayout>
      <StoreSettingsContent />
    </MerchantLayout>
  )
}
