'use client'

import { useEffect } from 'react'
import { useForm } from 'react-hook-form'

import {
  useNotificationSettings,
  useUpdateNotificationSettings,
} from '@/actions/hooks/storefront/notification'
import {
  NotificationSettingsFormValues,
  notificationSettingsSchema,
} from '@/zod/storefront/notification-settings'
import { zodResolver } from '@hookform/resolvers/zod'
import { IconBell } from '@tabler/icons-react'

import { PageTabHeader } from '@/components/PageTabHeader'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'

export function NotificationSettingsForm() {
  const { data: settings, isLoading } = useNotificationSettings()
  const { mutate: updateSettings, isPending } = useUpdateNotificationSettings()

  const {
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { isDirty },
  } = useForm<NotificationSettingsFormValues>({
    resolver: zodResolver(notificationSettingsSchema),
    defaultValues: {
      orderNotify: true,
      marketingNotify: false,
    },
  })

  useEffect(() => {
    if (settings) {
      reset({
        orderNotify: settings.orderNotify,
        marketingNotify: settings.marketingNotify,
      })
    }
  }, [settings, reset])

  const onSubmit = (data: NotificationSettingsFormValues) => {
    updateSettings(data, {
      onSuccess: () => reset(data),
    })
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Card>
        <CardHeader>
          <PageTabHeader
            variant="secondary"
            title="ตั้งค่าการแจ้งเตือน"
            icon={IconBell}
          />
        </CardHeader>
        <CardContent className="divide-border divide-y">
          <div className="flex items-center justify-between pb-4">
            <div className="pr-4">
              <span className="block text-sm font-medium">
                แจ้งเตือนสถานะคำสั่งซื้อ
              </span>
              <span className="text-muted-foreground mt-1 block max-w-xl text-xs leading-relaxed">
                รับการยืนยันทางอีเมลและการแจ้งเตือนในระบบเมื่อสินค้าถูกจัดส่ง
                ชำระเงินผ่าน หรืออัปเดตสเตตัสพัสดุ
              </span>
            </div>
            <Switch
              checked={watch('orderNotify')}
              disabled={isLoading}
              onCheckedChange={(checked) =>
                setValue('orderNotify', checked, { shouldDirty: true })
              }
            />
          </div>
          <div className="flex items-center justify-between pt-4">
            <div className="pr-4">
              <span className="block text-sm font-medium">
                ข่าวสารและโปรโมชั่นพิเศษ
              </span>
              <span className="text-muted-foreground mt-1 block max-w-xl text-xs leading-relaxed">
                รับข้อมูลรหัสคูปองส่วนลด แคมเปญลดกระหน่ำประจำเดือน
                และกิจกรรมการตลาดต่างๆ จากระบบ
              </span>
            </div>
            <Switch
              checked={watch('marketingNotify')}
              disabled={isLoading}
              onCheckedChange={(checked) =>
                setValue('marketingNotify', checked, { shouldDirty: true })
              }
            />
          </div>
        </CardContent>
        <CardFooter className="flex flex-wrap justify-end gap-2.5 border-t">
          {isDirty && (
            <Button
              type="button"
              variant="outline"
              onClick={() => reset()}
              disabled={isPending}
            >
              ล้างค่าการตั้งค่า
            </Button>
          )}
          <Button type="submit" disabled={isPending || !isDirty || isLoading}>
            {isPending ? 'กำลังบันทึก...' : 'บันทึกการตั้งค่า'}
          </Button>
        </CardFooter>
      </Card>
    </form>
  )
}
