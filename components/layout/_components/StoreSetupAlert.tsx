'use client'

import Link from 'next/link'

import { SettingsTab } from '@/constants/settings'
import { useStoreData } from '@/stores/sites/use-store-data'
import { useMerchantStoreSetupStore } from '@/stores/use-merchant-store-setup-store'
import { AlertCircleIcon } from 'lucide-react'

import { Alert, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'

export function StoreSetupAlert() {
  const { store } = useStoreData()
  const { hasShipping, hasPayment, isConfigured } = useMerchantStoreSetupStore()

  if (isConfigured) {
    return null
  }

  const missingItems: string[] = []
  if (!hasShipping) {
    missingItems.push('ช่องทางการจัดส่ง')
  }
  if (!hasPayment) {
    missingItems.push('ช่องทางการชำระเงิน')
  }

  const missingText = missingItems.join(' และ ')

  return (
    <Alert
      className="border-l-primary w-full rounded-none border-l-4 shadow-none"
      style={{ '--primary': store?.primaryColor } as React.CSSProperties}
    >
      <AlertCircleIcon className="text-primary size-5" />
      <AlertTitle className="text-primary font-semibold">
        ตั้งค่าร้านค้าของคุณยังไม่สมบูรณ์
      </AlertTitle>
      <div className="flex flex-wrap items-center justify-between gap-5">
        <div className="text-muted-foreground flex-1 shrink-0 text-sm">
          ร้านค้าของคุณยังไม่ได้ตั้งค่า {missingText}{' '}
          เพื่อให้ลูกค้าสามารถสั่งซื้อสินค้าได้ โปรดดำเนินการตั้งค่า
        </div>
        <div className="flex w-full shrink-0 items-center gap-2 sm:w-auto">
          {!hasShipping && (
            <Button variant="outline" size="sm" asChild>
              <Link href={`/merchant/settings?tab=${SettingsTab.SHIPPING}`}>
                ตั้งค่าการจัดส่ง
              </Link>
            </Button>
          )}
          {!hasPayment && (
            <Button variant="outline" size="sm" asChild>
              <Link href={`/merchant/settings?tab=${SettingsTab.PAYMENT}`}>
                ตั้งค่าการชำระเงิน
              </Link>
            </Button>
          )}
        </div>
      </div>
    </Alert>
  )
}
