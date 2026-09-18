'use client'

import { BranchSelectField } from '@/components/BranchSelectField'
import { ResellerAgreementSelectField } from '@/components/ResellerAgreementSelectField'
import { StoreSelectField } from '@/components/StoreSelectField'

export function PosHeaderFilters() {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <StoreSelectField />
      <BranchSelectField />
      <ResellerAgreementSelectField />
    </div>
  )
}

