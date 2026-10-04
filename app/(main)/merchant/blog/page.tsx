'use client'

import Link from 'next/link'

import { useEmployeePermission } from '@/actions/store/employee/hooks'
import { MERCHANT_NAVIGATION } from '@/constants/store/navigation'
import { ALL_STORES, useStoreFilter } from '@/stores/use-store-filter'
import { IconLock, IconNews, IconPlus } from '@tabler/icons-react'

import { ActionRequiredAlert } from '@/components/shared/ActionRequiredAlert'
import { PageTabHeader } from '@/components/layout/PageTabHeader'
import { StoreSelectField } from '@/components/form/StoreSelectField'
import { Sidebar } from '@/components/layout/Sidebar'
import { Button } from '@/components/ui/button'

import { BlogTable } from './_components/BlogTable'

export default function MerchantBlogsPage() {
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
        title="บทความทั้งหมด"
        description="จัดการบทความ ข่าวสาร และเนื้อหาสำหรับเผยแพร่ในบล็อกของร้านค้าคุณ"
        endContent={
          <div className="flex flex-wrap items-end gap-5">
            <StoreSelectField />
            {canCreateBlogs && (
              <Button asChild variant="outline">
                <Link href={'/merchant/blog/create'}>
                  <IconPlus />
                  เพิ่มบทความใหม่
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
          title="ไม่มีสิทธิ์เข้าถึง"
          description="คุณไม่มีสิทธิ์ในการดูข้อมูลบทความของสาขาหรือร้านค้านี้"
        />
      ) : (
        <BlogTable />
      )}
    </Sidebar>
  )
}
