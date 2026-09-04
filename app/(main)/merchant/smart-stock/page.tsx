'use client'

import { useState } from 'react'

import Link from 'next/link'

import { useEmployeePermission } from '@/actions/hooks/employee'
import { MERCHANT_NAVIGATION } from '@/constants/navigation'
import { ALL_STORES, useStoreFilter } from '@/stores/use-store-filter'
import { IconCpu, IconExternalLink, IconLock } from '@tabler/icons-react'
import { XIcon } from 'lucide-react'

import { ActionRequiredAlert } from '@/components/ActionRequiredAlert'
import { BranchSelectField } from '@/components/BranchSelectField'
import { PageTabHeader } from '@/components/PageTabHeader'
import { StoreSelectField } from '@/components/StoreSelectField'
import { Sidebar } from '@/components/layout/Sidebar'
import { Button } from '@/components/ui/button'

import { SmartStockOverviewCards } from './_components/SmartStockOverviewCards'
import { SmartStockTable } from './_components/SmartStockTable'

export default function MerchantSmartStockPage() {
  const { selectedStoreId } = useStoreFilter()
  const { canViewInventory, isLoading: isPermissionLoading } =
    useEmployeePermission()

  const [hasMismatch, setHasMismatch] = useState(true)

  return (
    <Sidebar redirectPath="merchant" items={MERCHANT_NAVIGATION}>
      <PageTabHeader
        icon={IconCpu}
        title="สต็อกสินค้าอัจฉริยะ"
        description="ตรวจสอบและจัดการสต็อกสินค้าแบบซิงค์อัตโนมัติระหว่างคลังหน้าร้าน (Local), Shopee, Lazada และ Facebook Marketplace"
        endContent={
          <div className="flex flex-wrap items-end gap-2.5">
            <StoreSelectField />
            <BranchSelectField />
            <Button variant="outline" size="sm" asChild>
              <Link href="/merchant/settings?tab=marketplace">
                ตั้งค่าเชื่อมต่อ API{' '}
                <IconExternalLink className="ml-1 size-3.5" />
              </Link>
            </Button>
          </div>
        }
      />
      {selectedStoreId === ALL_STORES ? (
        <ActionRequiredAlert />
      ) : !isPermissionLoading && !canViewInventory ? (
        <ActionRequiredAlert
          icon={<IconLock />}
          title="ไม่มีสิทธิ์เข้าถึง"
          description="คุณไม่มีสิทธิ์ในการจัดการข้อมูลคลังสินค้าของสาขาหรือร้านค้านี้"
        />
      ) : (
        <div className="space-y-6">
          <SmartStockOverviewCards />
          {hasMismatch && (
            <ActionRequiredAlert
              variant="warning"
              title="พบสินค้าสต็อกไม่ตรงกัน 1 รายการ"
              description="สินค้า 'แก้วเก็บความเย็นสแตนเลส 30oz (TUMBLER-30-BLK)' บน Lazada มียอดสต็อกไม่ตรงกับคลังหลัก กรุณากดปุ่มซิงค์เพื่อปรับให้ตรงกัน"
              action={
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setHasMismatch(false)}
                >
                  รับทราบแล้ว
                </Button>
              }
            />
          )}
          <ActionRequiredAlert
            variant="info"
            title="ระบบซิงค์สต็อกรวมศูนย์อัตโนมัติ (Shared Pool Stock)"
            description="เมื่อมีการขายสินค้าเกิดขึ้นผ่านหน้าร้าน POS หรือมาร์เก็ตเพลสใดๆ ยอดสต็อกในคลังหลักจะถูกตัด และกระจายยอดใหม่ไปยัง Shopee, Lazada และ Facebook Marketplace แบบเรียลไทม์เพื่อป้องกันการขายเกินสต็อก"
            action={
              <Button size="sm" variant="outline">
                รับทราบแล้ว
              </Button>
            }
          />
          <SmartStockTable onMismatchResolved={() => setHasMismatch(false)} />
        </div>
      )}
    </Sidebar>
  )
}
