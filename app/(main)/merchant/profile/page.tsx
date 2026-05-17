'use client'

import { MerchantLayout } from '@/app/sites/[domain]/_components/layout/admin/MerchantLayout'

import { ProfileContent } from '../_components/ProfileContent'

export default function MerchantProfilePage() {
  return (
    <MerchantLayout>
      <ProfileContent />
    </MerchantLayout>
  )
}
