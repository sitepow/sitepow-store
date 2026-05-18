'use client'

import { useState } from 'react'

import { IconCheck, IconLoader2, IconUser } from '@tabler/icons-react'

import { PageTabHeader } from '@/components/PageTabHeader'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Field, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'

export function SecuritySettingsForm() {
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
          icon={IconUser}
          title="ความปลอดภัยบัญชีผู้ดูแลระบบหลัก"
          description="ปรับเปลี่ยนรหัสผ่านเพื่อการเข้าถึงฐานระบบหลัก มีผลบังคับใช้ครอบคลุมทุกแบรนด์ภายใต้สัญญานี้"
        />
      </CardHeader>

      <CardContent className="space-y-5">
        <Field>
          <FieldLabel>รหัสผ่านปัจจุบันของคุณ (Current Password)</FieldLabel>
          <Input id="curr-pass" type="password" placeholder="••••••••••••" />
        </Field>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <Field>
            <FieldLabel>รหัสผ่านชุดใหม่ (New Password)</FieldLabel>
            <Input
              id="new-pass"
              type="password"
              placeholder="ความยาวขั้นต่ำ 8 ตัวอักษร"
            />
          </Field>
          <Field>
            <FieldLabel>
              ยืนยันรหัสผ่านใหม่อีกครั้ง (Confirm New Password)
            </FieldLabel>
            <Input
              id="confirm-pass"
              type="password"
              placeholder="กรอกให้ตรงกับช่องด้านซ้าย"
            />
          </Field>
        </div>

        <div className="border-input bg-muted/20 mt-2 flex items-center justify-between rounded-xl border border-dashed p-4">
          <div className="pr-4">
            <span className="block text-sm font-medium">
              เปิดใช้งานมาตรการยืนยันตัวตน 2 ชั้น (Two-Factor Authentication /
              2FA)
            </span>
            <span className="text-muted-foreground mt-1 block text-xs leading-relaxed">
              เพิ่มเกราะป้องกันความปลอดภัยขั้นสูงสุดให้กับร้านค้า
              โดยระบบจะบังคับส่งรหัส OTP
              ผ่านอีเมลหรือแอปพลิเคชันทุกครั้งที่มีการล็อกอินผ่านเบราว์เซอร์หรืออุปกรณ์แปลกใหม่
            </span>
          </div>
          <Switch />
        </div>
      </CardContent>

      <CardFooter className="flex justify-end border-t">
        <Button size="sm" onClick={handleSave} disabled={isSaving}>
          {isSaving ? (
            <>
              <IconLoader2 size={14} className="animate-spin" /> กำลังตรวจสอบ...
            </>
          ) : (
            <>
              <IconCheck size={14} /> อัปเดตรหัสผ่านใหม่
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}
