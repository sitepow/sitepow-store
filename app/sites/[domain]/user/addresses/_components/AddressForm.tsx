import { FormEvent } from 'react'

import { Button } from '@/components/ui/button'
import { DialogFooter } from '@/components/ui/dialog'
import { Field, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'

interface AddressFormProps {
  title: string
  receiverName: string
  phone: string
  details: string
  onTitleChange: (value: string) => void
  onReceiverNameChange: (value: string) => void
  onPhoneChange: (value: string) => void
  onDetailsChange: (value: string) => void
  onSubmit: (e: FormEvent) => void
  onCancel: () => void
}

export function AddressForm({
  title,
  receiverName,
  phone,
  details,
  onTitleChange,
  onReceiverNameChange,
  onPhoneChange,
  onDetailsChange,
  onSubmit,
  onCancel,
}: AddressFormProps) {
  return (
    <form onSubmit={onSubmit} className="grid gap-4">
      <Field>
        <FieldLabel>ป้ายชื่อเรียกที่อยู่</FieldLabel>
        <Input
          placeholder="เช่น บ้านหลัก, คอนโด, ออฟฟิศพญาไท, บ้านแม่"
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          required
        />
      </Field>
      <div className="grid grid-cols-2 gap-4">
        <Field>
          <FieldLabel>ชื่อ-นามสกุล ผู้รับ</FieldLabel>
          <Input
            placeholder="ชื่อผู้รับสินค้า"
            value={receiverName}
            onChange={(e) => onReceiverNameChange(e.target.value)}
            required
          />
        </Field>
        <Field>
          <FieldLabel>เบอร์โทรศัพท์ติดต่อ</FieldLabel>
          <Input
            placeholder="เบอร์โทรศัพท์"
            value={phone}
            onChange={(e) => onPhoneChange(e.target.value)}
            required
          />
        </Field>
      </div>
      <Field>
        <FieldLabel>ที่อยู่โดยละเอียด</FieldLabel>
        <Textarea
          placeholder="บ้านเลขที่, ถนน, ซอย, ตำบล/แขวง, อำเภอ/เขต, จังหวัด, รหัสไปรษณีย์"
          rows={4}
          value={details}
          onChange={(e) => onDetailsChange(e.target.value)}
          required
        />
      </Field>
      <DialogFooter className="mt-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          ยกเลิก
        </Button>
        <Button type="submit">บันทึกข้อมูล</Button>
      </DialogFooter>
    </form>
  )
}
