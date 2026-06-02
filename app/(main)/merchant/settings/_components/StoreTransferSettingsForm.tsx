'use client'

import { useState } from 'react'

import { IconLoader2, IconMail, IconReplace } from '@tabler/icons-react'

import { PageTabHeader } from '@/components/PageTabHeader'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Field, FieldDescription, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'

export function StoreTransferSettingsForm() {
  const [isSaving, setIsSaving] = useState(false)
  const [email, setEmail] = useState('')

  const handleTransfer = () => {
    if (!email) {
      return
    }

    setIsSaving(true)
    setTimeout(() => {
      setIsSaving(false)
      alert(
        `ส่งคำขอโอนย้ายร้านค้าไปยัง ${email} เรียบร้อยแล้ว (ลิงก์หมดอายุภายใน 24 ชม.)`,
      )
    }, 1200)
  }

  return (
    <Card>
      <CardHeader>
        <PageTabHeader
          variant="secondary"
          icon={IconReplace}
          title="โอนย้ายความเป็นเจ้าของร้านค้า"
          description="ทำการส่งคำขอไปยังบัญชีผู้ใช้ท่านอื่นเพื่อโอนกรรมสิทธิ์ สิทธิ์ขาดในการตั้งค่า และสิทธิ์ความเป็น Owner ของร้านค้านี้"
        />
      </CardHeader>

      <CardContent className="space-y-5">
        <Alert variant="destructive" className="border-red-200 bg-red-50/50">
          <AlertTitle className="text-sm font-semibold text-red-800">
            คำเตือนและข้อควรระวังสำคัญ
          </AlertTitle>
          <AlertDescription className="mt-1 text-xs leading-relaxed text-red-700">
            เมื่อกระบวนการโอนย้ายได้รับการยอมรับ (ACCEPTED) โดยผู้รับปลายทาง
            บัญชีปัจจุบันของคุณจะถูกลดระดับสิทธิ์ลงทันที
            และคุณจะไม่สามารถเข้าถึงการจัดการงบดุล รายได้
            หรือสิทธิ์การตั้งค่าระบบหลักของร้านค้านี้ได้อีกต่อไป
          </AlertDescription>
        </Alert>

        <Field>
          <FieldLabel>
            อีเมลของผู้รับโอนสิทธิ์ปลายทาง (Recipient Email)
          </FieldLabel>
          <div className="relative mt-1">
            <Input
              id="transfer-email"
              type="email"
              placeholder="example@merchant.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <FieldDescription className="text-muted-foreground mt-1 text-xs">
            ระบบจะทำการสร้าง Security Token
            และส่งคำเชิญไปยังอีเมลนี้เพื่อให้ผู้รับเข้ามากดยืนยันการรับโอนร้านค้าในระบบ
          </FieldDescription>
        </Field>
      </CardContent>

      <CardFooter className="flex justify-end border-t">
        <Button
          variant="destructive"
          size="sm"
          onClick={handleTransfer}
          disabled={isSaving || !email}
        >
          {isSaving ? (
            <>
              <IconLoader2 size={14} className="animate-spin" />{' '}
              กำลังตรวจสอบระบบความปลอดภัย...
            </>
          ) : (
            <>
              <IconMail size={14} /> ส่งลิงก์คำขอโอนย้ายร้านค้า
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}
