'use client'

import { useCallback, useEffect } from 'react'
import { FormProvider, useForm } from 'react-hook-form'

import {
  useNotificationSettings,
  useUpdateNotificationSettings,
} from '@/actions/hooks/notification-settings'
import { ALL_STORES, useStoreFilter } from '@/stores/use-store-filter'
import {
  NotificationSettingsFormValues,
  notificationSettingsSchema,
} from '@/zod/notification-settings'
import { zodResolver } from '@hookform/resolvers/zod'
import { IconBell } from '@tabler/icons-react'

import { ActionRequiredAlert } from '@/components/ActionRequiredAlert'
import { PageTabHeader } from '@/components/PageTabHeader'
import { StoreSelectField } from '@/components/StoreSelectField'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Spinner } from '@/components/ui/spinner'

import { NotificationRow } from './_components/NotificationRow'

export function NotificationSettingsForm() {
  const { selectedStoreId } = useStoreFilter()
  const { data: notificationSettings } = useNotificationSettings(
    selectedStoreId as string,
  )
  const updateMutation = useUpdateNotificationSettings()

  const methods = useForm<NotificationSettingsFormValues>({
    resolver: zodResolver(notificationSettingsSchema),
    defaultValues: {
      notifyLowStock: true,
      notifyDailySummary: true,
      notifyBillingAlert: true,
    },
  })

  const {
    handleSubmit,
    reset,
    formState: { isDirty },
  } = methods

  const resetFormToDefaultDatabase = useCallback(() => {
    if (notificationSettings) {
      reset({
        ...notificationSettings,
      })
    }
  }, [notificationSettings, reset])

  useEffect(() => {
    if (notificationSettings) {
      resetFormToDefaultDatabase()
    }
  }, [notificationSettings, reset, resetFormToDefaultDatabase])

  const onSubmit = (values: NotificationSettingsFormValues) => {
    updateMutation.mutate({
      storeId: selectedStoreId,
      input: values,
    })
  }

  if (selectedStoreId === ALL_STORES) {
    return <ActionRequiredAlert />
  }

  return (
    <Card>
      <CardHeader>
        <PageTabHeader
          variant="secondary"
          title="การตั้งค่าระบบกระจายการแจ้งเตือน"
          description="กำหนดพฤติกรรมการรับส่งข้อมูลสำคัญและตัวแจ้งเตือนแบบเรียลไทม์ของระบบหลังบ้านไปยังพนักงานและผู้บริหาร"
          icon={IconBell}
          endContent={<StoreSelectField />}
        />
      </CardHeader>

      {selectedStoreId !== ALL_STORES && (
        <>
          <CardContent className="divide-border divide-y">
            <FormProvider {...methods}>
              <CardContent className="divide-border divide-y">
                <NotificationRow
                  name="notifyLowStock"
                  title="ระบบแจ้งเตือนเมื่อสินค้าใกล้หมดคลังวิกฤต"
                  description="ส่งอีเมลรายงานด่วนและแจ้งเตือนพนักงานคลังสินค้าทันทีเมื่อจำนวนสินค้าคงเหลือในสาขาใดๆ มีค่าต่ำกว่า Min Stock ที่ตั้งไว้"
                />
                <NotificationRow
                  name="notifyDailySummary"
                  title="รายงานสรุปยอดขายรายวันอัตโนมัติ"
                  description="ประมวลผลยอดจำหน่ายรวมของทุกร้านค้า แล้วสรุปส่งเป็นรายงานสถิติเข้าอีเมลหลักของผู้ดูแลระบบทุกคืนเวลา 23:59 น."
                />
                <NotificationRow
                  name="notifyBillingAlert"
                  title="แจ้งเตือนรอบบิลและค่าบริการ"
                  description="รับแจ้งเตือนล่วงหน้าเมื่อใกล้ถึงวันชำระค่าบริการรายเดือน หรือเมื่อโควตา AI Vision และ AI Search ใกล้หมด"
                />
              </CardContent>
            </FormProvider>
          </CardContent>

          <CardFooter className="flex flex-wrap justify-end gap-2.5 border-t">
            {isDirty && (
              <Button
                type="button"
                variant="outline"
                onClick={() => resetFormToDefaultDatabase()}
              >
                ล้างค่าการตั้งค่า
              </Button>
            )}

            <Button
              size="sm"
              disabled={updateMutation.isPending}
              onClick={handleSubmit(onSubmit)}
            >
              {updateMutation.isPending ? (
                <>
                  <Spinner />
                  กำลังบันทึก...
                </>
              ) : (
                'บันทึกการตั้งค่า'
              )}
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
  )
}
