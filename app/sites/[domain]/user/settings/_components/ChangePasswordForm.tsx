'use client'

import { useState } from 'react'

import { IconEye, IconEyeOff, IconLock } from '@tabler/icons-react'

import { PageTabHeader } from '@/components/PageTabHeader'
import { Button } from '@/components/ui/button'
import { ButtonGroup } from '@/components/ui/button-group'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Field, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'

export function ChangePasswordForm() {
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })

  return (
    <Card>
      <CardHeader>
        <PageTabHeader
          variant="secondary"
          icon={IconLock}
          title="เปลี่ยนรหัสผ่าน (Change Password)"
          description="แนะนำให้ใช้รหัสผ่านที่ปลอดภัย ผสมอักษรและตัวเลข เพื่อปกป้องกระเป๋าเงินรวมถึงแต้มสะสมทั้งหมดของคุณ"
        />
      </CardHeader>
      <CardContent className="space-y-4 text-xs">
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
          <Field>
            <FieldLabel>รหัสผ่านปัจจุบัน</FieldLabel>
            <ButtonGroup>
              <Input
                id="curr-pass"
                type={showCurrentPassword ? 'text' : 'password'}
                value={passwordForm.currentPassword}
                onChange={(e) =>
                  setPasswordForm({
                    ...passwordForm,
                    currentPassword: e.target.value,
                  })
                }
                className="bg-background h-9 text-xs"
                placeholder="••••••••"
              />
              <Button
                variant="outline"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                aria-label={
                  showCurrentPassword ? 'ซ่อนรหัสผ่าน' : 'แสดงรหัสผ่าน'
                }
              >
                {showCurrentPassword ? (
                  <IconEyeOff size={16} />
                ) : (
                  <IconEye size={16} />
                )}
              </Button>
            </ButtonGroup>
          </Field>
          <Field>
            <FieldLabel>รหัสผ่านใหม่</FieldLabel>
            <ButtonGroup>
              <Input
                type={showNewPassword ? 'text' : 'password'}
                value={passwordForm.newPassword}
                onChange={(e) =>
                  setPasswordForm({
                    ...passwordForm,
                    newPassword: e.target.value,
                  })
                }
                className="bg-background h-9 text-xs"
                placeholder="อย่างน้อย 8 ตัวอักษร"
              />
              <Button
                variant="outline"
                onClick={() => setShowNewPassword(!showNewPassword)}
                aria-label={
                  showCurrentPassword ? 'ซ่อนรหัสผ่าน' : 'แสดงรหัสผ่าน'
                }
              >
                {showNewPassword ? <IconEyeOff /> : <IconEye />}
              </Button>
            </ButtonGroup>
          </Field>
          <Field>
            <FieldLabel>ยืนยันรหัสผ่านใหม่</FieldLabel>
            <ButtonGroup>
              <Input
                type={showConfirmPassword ? 'text' : 'password'}
                value={passwordForm.confirmPassword}
                onChange={(e) =>
                  setPasswordForm({
                    ...passwordForm,
                    confirmPassword: e.target.value,
                  })
                }
                className="bg-background h-9 text-xs"
                placeholder="พิมพ์รหัสผ่านใหม่อีกครั้ง"
              />
              <Button
                variant="outline"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                aria-label={
                  showCurrentPassword ? 'ซ่อนรหัสผ่าน' : 'แสดงรหัสผ่าน'
                }
              >
                {showConfirmPassword ? (
                  <IconEyeOff size={16} />
                ) : (
                  <IconEye size={16} />
                )}
              </Button>
            </ButtonGroup>
          </Field>
        </div>
      </CardContent>
      <CardFooter className="justify-end">
        <Button>อัปเดตรหัสผ่าน</Button>
      </CardFooter>
    </Card>
  )
}
