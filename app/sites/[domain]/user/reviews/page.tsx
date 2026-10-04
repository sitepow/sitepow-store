'use client'

import { BUYER_NAVIGATION } from '@/constants/store/navigation'
import { IconStar } from '@tabler/icons-react'

import { PageTabHeader } from '@/components/layout/PageTabHeader'
import { Sidebar } from '@/components/layout/Sidebar'

import { MyReviewTable } from './_components/ReviewTable'

export default function MyReviewsPage() {
  return (
    <Sidebar redirectPath="user" items={BUYER_NAVIGATION}>
      <PageTabHeader
        icon={IconStar}
        title="รีวิวของฉัน"
        description="ประวัติการให้คะแนนและความคิดเห็นสินค้าทั้งหมดของคุณ"
      />
      <MyReviewTable />
    </Sidebar>
  )
}
