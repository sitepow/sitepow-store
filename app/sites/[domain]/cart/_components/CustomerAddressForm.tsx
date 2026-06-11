'use client'

import { useState } from 'react'

import { AddressType } from '@/generated/prisma/enums'
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
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Separator } from '@/components/ui/separator'

import { Address } from '@/lib/address/logic'

const InputThaiAddress = CreateInput()

export function CustomerAddressForm() {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    addressLine: '',
    district: '',
    subDistrict: '',
    province: '',
    postalCode: '',
    type: AddressType.SHIPPING as AddressType,
    receiverName: '',
    taxName: '',
    taxId: '',
    branchCode: '00000',
  })

  const handleChange = <K extends keyof typeof formData>(
    key: K,
    value: (typeof formData)[K],
  ) => {
    setFormData((prev) => ({ ...prev, [key]: value }))
  }

  const handleAddressAutoSelect = (selectedAddr: Address) => {
    setFormData((prev) => ({
      ...prev,
      subDistrict: selectedAddr.district,
      district: selectedAddr.amphoe,
      province: selectedAddr.province,
      postalCode: selectedAddr.zipcode,
    }))
  }

  const showShippingFields =
    formData.type === AddressType.SHIPPING || formData.type === AddressType.BOTH
  const showTaxFields =
    formData.type === AddressType.TAX || formData.type === AddressType.BOTH

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">
          <PlusIcon className="mr-2 size-4" />
          <span>เพิ่มที่อยู่จัดส่ง/ภาษี</span>
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-xl">
        <form
          onSubmit={(e) => {
            e.preventDefault()
            console.log(formData)
          }}
        >
          <DialogHeader>
            <DialogTitle>เพิ่มที่อยู่ใหม่</DialogTitle>
          </DialogHeader>

          <FieldGroup className="grid grid-cols-2 gap-x-5 gap-y-4 py-4">
            <Field className="col-span-2">
              <Label>ป้ายกำกับที่อยู่ (เช่น บ้าน, ที่ทำงาน) *</Label>
              <Input
                placeholder="ระบุป้ายกำกับ"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                required
              />
            </Field>

            <Field className="col-span-2">
              <Label className="text-primary mb-3 block font-bold">
                วัตถุประสงค์ของที่อยู่นี้
              </Label>
              <RadioGroup
                value={formData.type}
                onValueChange={(val) =>
                  handleChange('type', val as AddressType)
                }
                className="flex flex-wrap gap-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value={AddressType.SHIPPING} id="shipping" />
                  <Label
                    htmlFor="shipping"
                    className="cursor-pointer font-normal"
                  >
                    ส่งสินค้าอย่างเดียว
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value={AddressType.TAX} id="tax" />
                  <Label htmlFor="tax" className="cursor-pointer font-normal">
                    ออกใบกำกับภาษีอย่างเดียว
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value={AddressType.BOTH} id="both" />
                  <Label htmlFor="both" className="cursor-pointer font-normal">
                    เป็นทั้งที่ส่งและภาษี
                  </Label>
                </div>
              </RadioGroup>
            </Field>

            <Separator className="col-span-2" />

            {showShippingFields && (
              <Field className="col-span-2">
                <Label>ชื่อ-นามสกุล ผู้รับพัสดุ *</Label>
                <Input
                  placeholder="ระบุชื่อผู้รับสินค้า"
                  value={formData.receiverName}
                  onChange={(e) => handleChange('receiverName', e.target.value)}
                  required={showShippingFields}
                />
              </Field>
            )}

            {showTaxFields && (
              <div className="bg-muted/30 col-span-2 grid grid-cols-12 gap-4 rounded-lg border border-dashed p-4">
                <div className="text-muted-foreground col-span-12 text-sm font-semibold">
                  ข้อมูลผู้เสียภาษี
                </div>
                <Field className="col-span-12">
                  <Label>ชื่อผู้เสียภาษี (บุคคล/บริษัท) *</Label>
                  <Input
                    value={formData.taxName}
                    onChange={(e) => handleChange('taxName', e.target.value)}
                    placeholder="ระบุชื่อที่ปรากฏในใบกำกับภาษี"
                    required={showTaxFields}
                  />
                </Field>
                <Field className="col-span-8">
                  <Label>เลขประจำตัวผู้เสียภาษี *</Label>
                  <Input
                    value={formData.taxId}
                    onChange={(e) => handleChange('taxId', e.target.value)}
                    placeholder="เลข 13 หลัก"
                    maxLength={13}
                    required={showTaxFields}
                  />
                </Field>
                <Field className="col-span-4">
                  <Label>รหัสสาขา *</Label>
                  <Input
                    value={formData.branchCode}
                    onChange={(e) => handleChange('branchCode', e.target.value)}
                    placeholder="00000"
                    maxLength={5}
                    required={showTaxFields}
                  />
                </Field>
              </div>
            )}

            <Field className="col-span-2">
              <Label>หมายเลขโทรศัพท์ติดต่อ *</Label>
              <Input
                type="tel"
                value={formData.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                required
              />
            </Field>

            <Field className="col-span-2">
              <Label>บ้านเลขที่, หมู่ที่, ซอย, ถนน *</Label>
              <Input
                value={formData.addressLine}
                onChange={(e) => handleChange('addressLine', e.target.value)}
                placeholder="123/45 หมู่ 1 ซอย..."
                required
              />
            </Field>

            <Field>
              <Label>ตำบล / แขวง *</Label>
              <InputThaiAddress.District
                value={formData.subDistrict}
                onChange={(val) => handleChange('subDistrict', val)}
                onSelect={handleAddressAutoSelect}
              />
            </Field>

            <Field>
              <Label>อำเภอ / เขต *</Label>
              <InputThaiAddress.Amphoe
                value={formData.district}
                onChange={(val) => handleChange('district', val)}
                onSelect={handleAddressAutoSelect}
              />
            </Field>

            <Field>
              <Label>จังหวัด *</Label>
              <InputThaiAddress.Province
                value={formData.province}
                onChange={(val) => handleChange('province', val)}
                onSelect={handleAddressAutoSelect}
              />
            </Field>

            <Field>
              <Label>รหัสไปรษณีย์ *</Label>
              <InputThaiAddress.Zipcode
                value={formData.postalCode}
                onChange={(val) => handleChange('postalCode', val)}
                onSelect={handleAddressAutoSelect}
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
