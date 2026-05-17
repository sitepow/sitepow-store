'use client'

import { MerchantLayout } from '@/app/sites/[domain]/_components/layout/admin/MerchantLayout'

import { SettingsContent } from '../_components/SettingsContent'

export default function MerchantSettingsPage() {
  return (
    <MerchantLayout>
      <SettingsContent />
    </MerchantLayout>
  )
}
