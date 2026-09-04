'use client'

import { useTranslations } from 'next-intl'
import Link from 'next/link'

import { useEmployeePermission } from '@/actions/hooks/employee'
import { MERCHANT_NAVIGATION } from '@/constants/navigation'
import { ALL_STORES, useStoreFilter } from '@/stores/use-store-filter'
import { IconLock, IconNews, IconPlus } from '@tabler/icons-react'

import { ActionRequiredAlert } from '@/components/ActionRequiredAlert'
import { PageTabHeader } from '@/components/PageTabHeader'
import { StoreSelectField } from '@/components/StoreSelectField'
import { Sidebar } from '@/components/layout/Sidebar'
import { Button } from '@/components/ui/button'

import { BlogTable } from './_components/BlogTable'

export default function MerchantBlogsPage() {
  const t = useTranslations('merchant.blog')
  const { selectedStoreId } = useStoreFilter()
  const {
    canViewBlogs,
    canCreateBlogs,
    isLoading: isPermissionLoading,
  } = useEmployeePermission()

  return (
    <Sidebar redirectPath="merchant" items={MERCHANT_NAVIGATION}>
      <PageTabHeader
        icon={IconNews}
        title={t('title')}
        description={t('description')}
        endContent={
          <div className="flex flex-wrap items-end gap-5">
            <StoreSelectField />
            {canCreateBlogs && (
              <Button asChild variant="outline">
                <Link href={'/merchant/blog/create'}>
                  <IconPlus />
                  {t('addBlog')}
                </Link>
              </Button>
            )}
          </div>
        }
      />
      {selectedStoreId === ALL_STORES ? (
        <ActionRequiredAlert />
      ) : !isPermissionLoading && !canViewBlogs ? (
        <ActionRequiredAlert
          icon={<IconLock />}
          title={t('noAccessTitle')}
          description={t('noAccessDescription')}
        />
      ) : (
        <BlogTable />
      )}
    </Sidebar>
  )
}
