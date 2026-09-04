'use client'

import { useTranslations } from 'next-intl'

import { useEmployeePermission } from '@/actions/hooks/employee'
import { MERCHANT_NAVIGATION } from '@/constants/navigation'
import { IconBuildingStore, IconLock } from '@tabler/icons-react'

import { ActionRequiredAlert } from '@/components/ActionRequiredAlert'
import { BranchSelectField } from '@/components/BranchSelectField'
import { PageTabHeader } from '@/components/PageTabHeader'
import { StoreSelectField } from '@/components/StoreSelectField'
import { Sidebar } from '@/components/layout/Sidebar'
import { Skeleton } from '@/components/ui/skeleton'

import { StoreCreateDialog } from './_components/StoreCreateDialog'
import { StoreTable } from './_components/StoreTable'

export default function MerchantStoreSettingsPage() {
  const t = useTranslations('merchant.stores')
  const { canViewStore, isLoading: isPermissionLoading } =
    useEmployeePermission()

  return (
    <Sidebar redirectPath="merchant" items={MERCHANT_NAVIGATION}>
      <PageTabHeader
        icon={IconBuildingStore}
        title="จัดการร้านค้า"
        description="จัดการข้อมูลหน้าร้าน สลับเข้าสู่ระบบหลังบ้าน หรือเปิดร้านค้าใหม่เพื่อเริ่มธุรกิจเพิ่ม"
        title={t('title')}
        description={t('description')}
        endContent={
          <div className="flex flex-wrap items-end gap-2.5">
            <StoreSelectField />
            <BranchSelectField />
            <StoreCreateDialog />
          </div>
        }
      />
      {isPermissionLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      ) : !canViewStore ? (
        <ActionRequiredAlert
          icon={<IconLock />}
          title="ไม่มีสิทธิ์เข้าถึง"
          description="คุณไม่มีสิทธิ์ในการดูข้อมูลร้านค้านี้ แต่คุณสามารถสร้างร้านค้าของตัวเองขึ้นมาใหม่ได้"
          title={t('noAccessTitle')}
          description={t('noAccessDescription')}
        />
      ) : (
        <StoreTable />
      )}
    </Sidebar>
  )
}
