'use client'

import { useState } from 'react'

import { PlusIcon } from 'lucide-react'

import { CreateInput } from '@/components/AddressAutoField'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Field, FieldGroup } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

import { Address } from '@/lib/address/logic'

const InputThaiAddress = CreateInput()

export function CustomerAddressForm() {
  const [address, setAddress] = useState<Address>({
    district: '',
    amphoe: '',
    province: '',
    zipcode: '',
  })

  const handleChange = (scope: keyof Address) => (value: string) => {
    setAddress((oldAddr) => ({
      ...oldAddr,
      [scope]: value,
    }))
  }

  const handleSelect = (selectedAddr: Address) => {
    setAddress(selectedAddr)
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">
          <PlusIcon className="mr-2 size-4" />
          <span>เพิ่มที่อยู่จัดส่ง</span>
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-xl">
        <form
          onSubmit={(e) => {
            e.preventDefault()
            console.log('Submitted Data:', address)
          }}
        >
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2.5">
              <PlusIcon className="size-5" />
              <span>เพิ่มที่อยู่ใหม่</span>
            </DialogTitle>
          </DialogHeader>

          <FieldGroup className="grid grid-cols-2 gap-x-5 gap-y-4 py-4">
            <Field>
              <Label>ชื่อจริง *</Label>
              <Input name="firstName" required />
            </Field>
            <Field>
              <Label>นามสกุล *</Label>
              <Input name="lastName" required />
            </Field>
            <Field className="col-span-2">
              <Label>หมายเลขโทรศัพท์ผู้รับ *</Label>
              <Input name="telephone" type="tel" required />
            </Field>

            <Field className="col-span-2">
              <Label>บ้านเลขที่, หมู่ที่, ซอย, ถนน *</Label>
              <Input
                name="addressLine1"
                placeholder="123/45 หมู่ 1 ซอย..."
                required
              />
            </Field>

            <Field>
              <Label>ตำบล / แขวง *</Label>
              <InputThaiAddress.District
                value={address.district}
                onChange={handleChange('district')}
                onSelect={handleSelect}
                placeholder="ค้นหาตำบล..."
              />
            </Field>

            <Field>
              <Label>อำเภอ / เขต *</Label>
              <InputThaiAddress.Amphoe
                value={address.amphoe}
                onChange={handleChange('amphoe')}
                onSelect={handleSelect}
                placeholder="ค้นหาอำเภอ..."
              />
            </Field>

            <Field>
              <Label>จังหวัด *</Label>
              <InputThaiAddress.Province
                value={address.province}
                onChange={handleChange('province')}
                onSelect={handleSelect}
                placeholder="ค้นหาจังหวัด..."
              />
            </Field>

            <Field>
              <Label>รหัสไปรษณีย์ *</Label>
              <InputThaiAddress.Zipcode
                value={address.zipcode}
                onChange={handleChange('zipcode')}
                onSelect={handleSelect}
                placeholder="รหัสไปรษณีย์"
              />
            </Field>
          </FieldGroup>

          <DialogFooter>
            <Button className="w-full" type="submit" size="lg">
              บันทึกข้อมูลที่อยู่
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
