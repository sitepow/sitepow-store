'use client'

import { IconShieldLock } from '@tabler/icons-react'

import { PageTabHeader } from '@/components/PageTabHeader'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'

export function PdpaManagementForm() {
  return (
    <Card>
      <CardHeader>
        <PageTabHeader
          variant="secondary"
          icon={IconShieldLock}
          title="การจัดการข้อมูลส่วนบุคคล (PDPA)"
          description="คุ้มครองความเป็นส่วนตัวและสิทธิ์ของข้อมูลคุณภายใต้พระราชบัญญัติคุ้มครองข้อมูลส่วนบุคคล"
        />
      </CardHeader>
      <CardContent className="divide-border divide-y">
        <div className="flex flex-wrap items-center justify-between gap-5 pb-4">
          <div className="pr-4">
            <span className="flex items-center gap-1.5 text-sm font-medium">
              ขอส่งออกข้อมูลทั้งหมด (Data Portability)
            </span>
            <span className="text-muted-foreground mt-1 block max-w-xl text-xs leading-relaxed">
              ดาวน์โหลดข้อมูลส่วนตัวทั้งหมด ประวัติการสั่งซื้อสินค้าทุกร้านค้า
              และแต้มสะสมที่มีในระบบออกมาเก็บไว้ในรูปแบบไฟล์ข้อมูลมาตรฐาน
              (JSON/CSV)
            </span>
          </div>
          <Button variant="outline">ร้องขอไฟล์ข้อมูล</Button>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-5 pt-4">
          <div className="pr-4">
            <span className="text-destructive block text-sm font-medium">
              ขอลบบัญชีและข้อมูลผู้ใช้งาน (Delete Account)
            </span>
            <span className="text-muted-foreground mt-1 block max-w-xl text-xs leading-relaxed">
              ลบประวัติการใช้งานและข้อมูลโปรไฟล์ออกจากระบบอย่างถาวรตามกฎหมายสิทธิ์
              &quot;การถูกลืม&quot; (Right to Erasure)
            </span>
          </div>
          <Button variant="destructive">ขอลบข้อมูลบัญชี</Button>
        </div>
      </CardContent>
    </Card>
  )
}
