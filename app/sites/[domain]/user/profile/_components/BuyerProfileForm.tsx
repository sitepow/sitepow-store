import { ComponentProps } from 'react'

import { IconDeviceFloppy } from '@tabler/icons-react'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Field, FieldDescription, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'

interface BuyerProfileFormProps extends ComponentProps<typeof Card> {
  firstName: string
  lastName: string
  phone: string
  email: string
  onFirstNameChange: (value: string) => void
  onLastNameChange: (value: string) => void
  onPhoneChange: (value: string) => void
}

export function BuyerProfileForm({
  firstName,
  lastName,
  phone,
  email,
  onFirstNameChange,
  onLastNameChange,
  onPhoneChange,
  ...props
}: BuyerProfileFormProps) {
  return (
    <Card {...props}>
      <CardHeader>
        <CardTitle>แก้ไขข้อมูลส่วนบุคคล</CardTitle>
        <CardDescription>
          อัปเดตข้อมูลของคุณให้เป็นปัจจุบัน
          เพื่อประโยชน์ในการติดต่อประสานงานและจัดส่งสินค้า
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-5 sm:grid-cols-2">
        <Field>
          <FieldLabel>ชื่อจริง</FieldLabel>
          <Input
            value={firstName}
            onChange={(e) => onFirstNameChange(e.target.value)}
          />
        </Field>
        <Field>
          <FieldLabel>นามสกุล</FieldLabel>
          <Input
            value={lastName}
            onChange={(e) => onLastNameChange(e.target.value)}
          />
        </Field>
        <Field className="sm:col-span-2">
          <FieldLabel>อีเมลลงทะเบียน (ใช้เข้าสู่ระบบ)</FieldLabel>
          <Input value={email} disabled />
        </Field>
        <Field className="sm:col-span-2">
          <FieldLabel>เบอร์โทรศัพท์ติดต่อหลัก</FieldLabel>
          <Input
            value={phone}
            onChange={(e) => onPhoneChange(e.target.value)}
            placeholder="เช่น 0812345678"
          />
          <FieldDescription>
            เบอร์โทรศัพท์นี้ระบบจะใช้เชื่อมโยงกับฐานข้อมูลสมาชิกร้านค้า (Loyalty
            Points) ทั้งฝั่งออนไลน์ Sale Page และออฟไลน์หน้าร้าน POS
            เพื่อสะสมแต้มให้คุณโดยอัตโนมัติ
          </FieldDescription>
        </Field>
      </CardContent>
      <CardFooter className="flex justify-end border-t">
        <Button>
          <IconDeviceFloppy size={14} /> บันทึกข้อมูลโปรไฟล์
        </Button>
      </CardFooter>
    </Card>
  )
}
