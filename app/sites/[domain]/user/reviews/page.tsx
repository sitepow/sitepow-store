'use client'

import { useTranslations } from 'next-intl'

import { BUYER_NAVIGATION } from '@/constants/navigation'
import { IconStar } from '@tabler/icons-react'

import { PageTabHeader } from '@/components/PageTabHeader'
import { Sidebar } from '@/components/layout/Sidebar'

import { MyReviewTable } from './_components/ReviewTable'

export default function MyReviewsPage() {
  const t = useTranslations('customer.reviews')

  return (
    <Sidebar redirectPath="user" items={BUYER_NAVIGATION}>
      <PageTabHeader
        icon={IconStar}
        title={t('title')}
        description={t('description')}
      />
      <MyReviewTable />
    </Sidebar>
  )
}
