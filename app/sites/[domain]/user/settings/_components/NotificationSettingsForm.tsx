'use client'

import { useState } from 'react'

import { IconBell } from '@tabler/icons-react'

import { PageTabHeader } from '@/components/PageTabHeader'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'

export function NotificationSettingsForm() {
  const [orderNotify, setOrderNotify] = useState(true)
  const [marketingNotify, setMarketingNotify] = useState(false)

  return (
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
          <Switch checked={orderNotify} onCheckedChange={setOrderNotify} />
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
            checked={marketingNotify}
            onCheckedChange={setMarketingNotify}
          />
        </div>
      </CardContent>
    </Card>
  )
}
