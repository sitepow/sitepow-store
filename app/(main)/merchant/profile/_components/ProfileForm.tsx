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

export function ProfileForm({ ...props }: ComponentProps<typeof Card>) {
  return (
    <Card {...props}>
      <CardHeader>
        <CardTitle>ข้อมูลส่วนตัว</CardTitle>
        <CardDescription>
          ข้อมูลนี้จะใช้สำหรับระบุตัวตนของคุณในฐานะเจ้าของระบบและใช้รับอีเมลแจ้งเตือนสำคัญ
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-5 sm:grid-cols-2">
        <Field>
          <FieldLabel>ชื่อจริง</FieldLabel>
          <Input />
        </Field>
        <Field>
          <FieldLabel>นามสกุล</FieldLabel>
          <Input id="pf-lname" />
        </Field>
        <Field>
          <FieldLabel>อีเมลหลักของบัญชี (ล็อกอิน)</FieldLabel>
          <Input type="email" disabled />
          <FieldDescription>
            อีเมลล็อกอินไม่สามารถเปลี่ยนได้เอง กรุณาติดต่อฝ่ายสนับสนุน
          </FieldDescription>
        </Field>
        <Field>
          <FieldLabel>เบอร์โทรศัพท์ติดต่อ</FieldLabel>
          <Input />
        </Field>
      </CardContent>
      <CardFooter className="flex justify-end border-t">
        <Button>
          <IconDeviceFloppy size={14} /> บันทึกโปรไฟล์ส่วนตัว
        </Button>
      </CardFooter>
    </Card>
  )
}
