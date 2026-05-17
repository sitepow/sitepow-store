'use client'

import { MerchantLayout } from '@/app/sites/[domain]/_components/layout/admin/MerchantLayout'

import { OrganizationBranchesContent } from '../_components/OrganizationBranchesContent'

export default function MerchantOrganizationBranchesPage() {
  return (
    <MerchantLayout>
      <OrganizationBranchesContent />
    </MerchantLayout>
  )
}
