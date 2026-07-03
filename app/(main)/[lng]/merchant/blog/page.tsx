'use client'

import { MERCHANT_NAVIGATION } from '@/constants/navigation'
import { IconArticle } from '@tabler/icons-react'

import { PageTabHeader } from '@/components/PageTabHeader'
import { StoreSelectField } from '@/components/StoreSelectField'
import { DashboardSidebar } from '@/components/layout/DashboardSidebar'

import { BlogTable } from './_components/BlogTable'

export default function BlogPage() {
  return (
    <DashboardSidebar redirectPath="merchant" items={MERCHANT_NAVIGATION}>
      <PageTabHeader
        icon={IconArticle}
        title="บทความ"
        description="จัดการบทความและเนื้อหาของร้านค้า"
        endContent={<StoreSelectField />}
      />
      <BlogTable />
    </DashboardSidebar>
  )
}
