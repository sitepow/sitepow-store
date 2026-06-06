'use client'

import { useState } from 'react'

import { ALL_STORES, useStoreFilter } from '@/stores/use-store-filter'
import { IconMail, IconReplace } from '@tabler/icons-react'

import { ActionRequiredAlert } from '@/components/ActionRequiredAlert'
import { PageTabHeader } from '@/components/PageTabHeader'
import { StoreSelectField } from '@/components/StoreSelectField'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Field, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'

import { StoreTransferConfirmDialog } from './_components/StoreTransferConfirmDialog'
import { StoreTransferHistoryTable } from './_components/StoreTransferHistoryTable'

export function StoreTransferSettingsForm() {
  const { selectedStoreId } = useStoreFilter()
  const [email, setEmail] = useState('')
  const [confirmOpen, setConfirmOpen] = useState(false)

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <PageTabHeader
            variant="secondary"
            icon={IconReplace}
            title="โอนย้ายความเป็นเจ้าของร้านค้า"
            description="ทำการส่งคำขอไปยังบัญชีผู้ใช้ท่านอื่นเพื่อโอนกรรมสิทธิ์ สิทธิ์ขาดในการตั้งค่า และสิทธิ์ความเป็น Owner ของร้านค้านี้"
            endContent={<StoreSelectField />}
          />
        </CardHeader>

        {selectedStoreId !== ALL_STORES && (
          <>
            <CardContent className="space-y-5">
              <Alert
                variant="destructive"
                className="border-red-200 bg-red-50/50"
              >
                <AlertTitle className="text-sm font-semibold text-red-800">
                  คำเตือนและข้อควรระวัง
                </AlertTitle>
                <AlertDescription className="mt-1 text-xs leading-relaxed text-red-700">
                  เมื่อผู้รับยืนยันการโอน
                  บัญชีปัจจุบันของคุณจะถูกลดระดับสิทธิ์ลงทันที
                  และไม่สามารถเข้าถึงการจัดการงบดุล รายได้
                  หรือสิทธิ์การตั้งค่าระบบหลักของร้านค้านี้ได้อีกต่อไป
                </AlertDescription>
              </Alert>

              <Field>
                <FieldLabel>อีเมลของผู้รับโอนสิทธิ์</FieldLabel>
                <Input
                  type="email"
                  placeholder="example@merchant.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </Field>
            </CardContent>

            <CardFooter className="flex justify-end border-t">
              <Button
                variant="destructive"
                size="sm"
                disabled={!email}
                onClick={() => setConfirmOpen(true)}
              >
                <IconMail size={14} />
                ส่งคำขอโอนร้านค้า
              </Button>
            </CardFooter>
          </>
        )}

        {selectedStoreId === ALL_STORES && (
          <CardContent>
            <ActionRequiredAlert />
          </CardContent>
        )}
      </Card>

      {selectedStoreId !== ALL_STORES && (
        <>
          <StoreTransferHistoryTable />
          <StoreTransferConfirmDialog
            open={confirmOpen}
            toEmail={email}
            storeId={selectedStoreId as string}
            onClose={() => {
              setConfirmOpen(false)
              setEmail('')
            }}
          />
        </>
      )}
    </div>
  )
}
