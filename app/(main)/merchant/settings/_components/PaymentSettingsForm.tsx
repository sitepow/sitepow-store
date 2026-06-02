'use client'

import { useState } from 'react'

import {
  IconCreditCard,
  IconDeviceFloppy,
  IconLoader2,
} from '@tabler/icons-react'

import { PageTabHeader } from '@/components/PageTabHeader'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'

export function PaymentSettingsForm() {
  const [isSaving, setIsSaving] = useState(false)

  const handleSave = () => {
    setIsSaving(true)
    setTimeout(() => {
      setIsSaving(false)
    }, 1200)
  }

  return (
    <Card>
      <CardHeader>
        <PageTabHeader
          variant="secondary"
          icon={IconCreditCard}
          title="เกตเวย์และช่องทางรับชำระเงิน"
          description="เปิด-ปิดช่องทางการรับเงินสำหรับลูกค้าหน้า Sale Page และ POS พร้อมตั้งค่าบัญชีปลายทางในการรับรายได้"
        />
      </CardHeader>

      <CardContent className="divide-border divide-y">
        <div className="flex items-center justify-between pb-4">
          <div className="pr-4">
            <span className="block text-sm font-medium">
              โอนเงินผ่านบัญชีธนาคาร (Manual Bank Transfer)
            </span>
            <span className="text-muted-foreground mt-1 block max-w-xl text-xs leading-relaxed">
              ให้ลูกค้าแนบรูปภาพสลิปหลักฐาน (paymentProof) เข้ามาในระบบ
              เพื่อให้ผู้จัดการร้านคอยกดอนุมัติสิทธิ์ตรวจสลิปหลังบ้านด้วยตนเอง
            </span>
          </div>
          <Switch defaultChecked />
        </div>

        <div className="flex items-center justify-between py-4">
          <div className="pr-4">
            <span className="block text-sm font-medium">
              สแกนจ่ายผ่านพร้อมเพย์ไดนามิก (QR PromptPay Gateway)
            </span>
            <span className="text-muted-foreground mt-1 block max-w-xl text-xs leading-relaxed">
              สร้าง QR Code ยอดเงินตรงตามราคาสินค้าออเดอร์อัตโนมัติ
              ตรวจสอบยอดเงินเข้าบัญชีทันทีผ่าน Webhook ยืนยันสถานะเป็น PAID
              ไม่ต้องรอพนักงานตรวจสลิป
            </span>
          </div>
          <Switch defaultChecked />
        </div>

        <div className="flex items-center justify-between py-4">
          <div className="pr-4">
            <span className="block text-sm font-medium">
              บัตรเครดิตและเดบิต (Credit / Debit Card)
            </span>
            <span className="text-muted-foreground mt-1 block max-w-xl text-xs leading-relaxed">
              รับชำระเงินผ่านบัตรเครดิต Visa, Mastercard และ JCB (ประมวลผลผ่าน
              Omise / GB Prime Pay Gateway ปลอดภัยสูง)
            </span>
          </div>
          <Switch />
        </div>

        <div className="flex items-center justify-between pt-4">
          <div className="pr-4">
            <span className="block text-sm font-medium">
              บริการเก็บเงินปลายทาง (Cash on Delivery - COD)
            </span>
            <span className="text-muted-foreground mt-1 block max-w-xl text-xs leading-relaxed">
              เรียกเก็บเงินสดเมื่อพัสดุเดินทางถึงมือผู้รับ
              (ฟังก์ชันจะผูกกับเงื่อนไขการหักค่าบริการขนส่งในกระเป๋าเงินระบบ
              balance ของร้านค้า)
            </span>
          </div>
          <Switch />
        </div>
      </CardContent>

      <CardFooter className="flex justify-end border-t">
        <Button size="sm" onClick={handleSave} disabled={isSaving}>
          {isSaving ? (
            <>
              <IconLoader2 size={14} className="animate-spin" />{' '}
              กำลังบันทึกโครงสร้าง Gateway...
            </>
          ) : (
            <>
              <IconDeviceFloppy size={14} /> บันทึกช่องทางชำระเงิน
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}
