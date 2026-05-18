'use client'

import { IconBell } from '@tabler/icons-react'

import { PageTabHeader } from '@/components/PageTabHeader'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'

export function NotificationSettingsForm() {
  return (
    <Card>
      <CardHeader>
        <PageTabHeader
          variant="secondary"
          title="การตั้งค่าระบบกระจายการแจ้งเตือน"
          description="กำหนดพฤติกรรมการรับส่งข้อมูลสำคัญและตัวแจ้งเตือนแบบเรียลไทม์ของระบบหลังบ้านไปยังพนักงานและผู้บริหาร"
          icon={IconBell}
        />
      </CardHeader>
      <CardContent className="divide-border divide-y">
        <div className="flex items-center justify-between pb-4">
          <div className="pr-4">
            <span className="block text-sm font-medium">
              ระบบแจ้งเตือนเมื่อสินค้าใกล้หมดคลังวิกฤต (Low Stock Alert
              Automation)
            </span>
            <span className="text-muted-foreground mt-1 block max-w-xl text-xs leading-relaxed">
              ส่งอีเมลรายงานด่วนและแจ้งเตือนพนักงานคลังสินค้าทันทีเมื่อจำนวนพัสดุสินค้าคงเหลือในระบบ
              POS ของสาขาใด ๆ มีค่าต่ำกว่าจุดสั่งซื้อขั้นต่ำ (Min Stock)
              ที่ตั้งเอาไว้ตามกฎ Prisma Schema
            </span>
          </div>
          <Switch defaultChecked />
        </div>

        <div className="flex items-center justify-between py-4">
          <div className="pr-4">
            <span className="block text-sm font-medium">
              รายงานสรุปยอดขายรายวันอัตโนมัติ (Daily Sales Analytical Summary
              Email)
            </span>
            <span className="text-muted-foreground mt-1 block max-w-xl text-xs leading-relaxed">
              ทำการประมวลผลข้อมูลยอดจำหน่ายรวมของทุกร้านค้า
              แล้วสรุปส่งเป็นรายงานสถิติเข้าอีเมลหลักของผู้ดูแลระบบ
              เป็นประจำทุกคืนเวลา 23:59 น. สำหรับปิดรอบบัญชีประจำวัน
            </span>
          </div>
          <Switch defaultChecked />
        </div>

        <div className="flex items-center justify-between pt-4">
          <div className="pr-4">
            <span className="block text-sm font-medium">
              แจ้งเตือนรอบบิลและค่าบริการเครดิต (Billing & Subscription
              Lifecycle Alerts)
            </span>
            <span className="text-muted-foreground mt-1 block max-w-xl text-xs leading-relaxed">
              รับข้อมูลแจ้งเตือนล่วงหน้าเมื่อใกล้ถึงวันกำหนดชำระค่าบริการแพลนรายเดือน
              หรือเมื่อโควตาการประมวลผลของ AI Vision และ AI Search
              ใกล้หมดหลอดโควตาโบนัสฟรี
            </span>
          </div>
          <Switch defaultChecked />
        </div>
      </CardContent>
    </Card>
  )
}
