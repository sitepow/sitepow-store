'use client'

import { useState } from 'react'
import { Controller, useForm } from 'react-hook-form'

import { useCreateAddress } from '@/actions/hooks/storefront/address'
import { AddressType } from '@/generated/prisma/enums'
import { AddressSchema, addressSchema } from '@/zod/address'
import { zodResolver } from '@hookform/resolvers/zod'
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
import { Field, FieldError, FieldGroup } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Separator } from '@/components/ui/separator'
import { Spinner } from '@/components/ui/spinner'

import { Address } from '@/lib/address/logic'

const InputThaiAddress = CreateInput()

export function CustomerAddressCreateDialog() {
  const [open, setOpen] = useState(false)
  const { mutate: createAddress, isPending } = useCreateAddress()

  const {
    register,
    handleSubmit,
    reset,
    watch,
    control,
    setValue,
    formState: { errors },
  } = useForm<AddressSchema>({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      type: AddressType.SHIPPING,
      branchCode: '00000',
    },
  })

  const type = watch('type')
  const showShippingFields =
    type === AddressType.SHIPPING || type === AddressType.BOTH
  const showTaxFields = type === AddressType.TAX || type === AddressType.BOTH

  const handleClose = () => {
    reset()
    setOpen(false)
  }

  const handleAddressAutoSelect = (selectedAddr: Address) => {
    setValue('subDistrict', selectedAddr.district)
    setValue('district', selectedAddr.amphoe)
    setValue('province', selectedAddr.province)
    setValue('postalCode', selectedAddr.zipcode)
  }

  const onSubmit = (data: AddressSchema) => {
    createAddress(
      {
        ...data,
        receiverName: data.receiverName ?? null,
        taxName: data.taxName ?? null,
        taxId: data.taxId ?? null,
        branchCode: data.branchCode ?? null,
      },
      { onSuccess: handleClose },
    )
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) handleClose()
        setOpen(v)
      }}
    >
      <DialogTrigger asChild>
        <Button variant="outline">
          <PlusIcon className="mr-2 size-4" />
          <span>เพิ่มที่อยู่จัดส่ง/ภาษี</span>
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-xl">
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogHeader>
            <DialogTitle>เพิ่มที่อยู่ใหม่</DialogTitle>
          </DialogHeader>

          <FieldGroup className="grid grid-cols-2 gap-x-5 gap-y-4 py-4">
            <Field className="col-span-2">
              <Label>ป้ายกำกับที่อยู่ (เช่น บ้าน, ที่ทำงาน) *</Label>
              <Input {...register('name')} placeholder="ระบุป้ายกำกับ" />
              <FieldError>{errors.name?.message}</FieldError>
            </Field>

            <Field className="col-span-2">
              <Label className="text-primary mb-3 block font-bold">
                วัตถุประสงค์ของที่อยู่นี้
              </Label>
              <Controller
                control={control}
                name="type"
                render={({ field }) => (
                  <RadioGroup
                    value={field.value}
                    onValueChange={field.onChange}
                    className="flex flex-wrap gap-4"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem
                        value={AddressType.SHIPPING}
                        id="shipping"
                      />
                      <Label
                        htmlFor="shipping"
                        className="cursor-pointer font-normal"
                      >
                        ส่งสินค้าอย่างเดียว
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value={AddressType.TAX} id="tax" />
                      <Label
                        htmlFor="tax"
                        className="cursor-pointer font-normal"
                      >
                        ออกใบกำกับภาษีอย่างเดียว
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value={AddressType.BOTH} id="both" />
                      <Label
                        htmlFor="both"
                        className="cursor-pointer font-normal"
                      >
                        เป็นทั้งที่ส่งและภาษี
                      </Label>
                    </div>
                  </RadioGroup>
                )}
              />
            </Field>

            <Separator className="col-span-2" />

            {showShippingFields && (
              <Field className="col-span-2">
                <Label>ชื่อ-นามสกุล ผู้รับพัสดุ *</Label>
                <Input
                  {...register('receiverName')}
                  placeholder="ระบุชื่อผู้รับสินค้า"
                />
                <FieldError>{errors.receiverName?.message}</FieldError>
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
                    {...register('taxName')}
                    placeholder="ระบุชื่อที่ปรากฏในใบกำกับภาษี"
                  />
                  <FieldError>{errors.taxName?.message}</FieldError>
                </Field>
                <Field className="col-span-8">
                  <Label>เลขประจำตัวผู้เสียภาษี *</Label>
                  <Input
                    {...register('taxId')}
                    placeholder="เลข 13 หลัก"
                    maxLength={13}
                  />
                  <FieldError>{errors.taxId?.message}</FieldError>
                </Field>
                <Field className="col-span-4">
                  <Label>รหัสสาขา *</Label>
                  <Input
                    {...register('branchCode')}
                    placeholder="00000"
                    maxLength={5}
                  />
                  <FieldError>{errors.branchCode?.message}</FieldError>
                </Field>
              </div>
            )}

            <Field className="col-span-2">
              <Label>หมายเลขโทรศัพท์ติดต่อ *</Label>
              <Input {...register('phone')} type="tel" />
              <FieldError>{errors.phone?.message}</FieldError>
            </Field>

            <Field className="col-span-2">
              <Label>บ้านเลขที่, หมู่ที่, ซอย, ถนน *</Label>
              <Input
                {...register('addressLine')}
                placeholder="123/45 หมู่ 1 ซอย..."
              />
              <FieldError>{errors.addressLine?.message}</FieldError>
            </Field>

            <Field>
              <Label>ตำบล / แขวง *</Label>
              <Controller
                control={control}
                name="subDistrict"
                render={({ field }) => (
                  <InputThaiAddress.District
                    value={field.value ?? ''}
                    onChange={field.onChange}
                    onSelect={handleAddressAutoSelect}
                  />
                )}
              />
              <FieldError>{errors.subDistrict?.message}</FieldError>
            </Field>

            <Field>
              <Label>อำเภอ / เขต *</Label>
              <Controller
                control={control}
                name="district"
                render={({ field }) => (
                  <InputThaiAddress.Amphoe
                    value={field.value ?? ''}
                    onChange={field.onChange}
                    onSelect={handleAddressAutoSelect}
                  />
                )}
              />
              <FieldError>{errors.district?.message}</FieldError>
            </Field>

            <Field>
              <Label>จังหวัด *</Label>
              <Controller
                control={control}
                name="province"
                render={({ field }) => (
                  <InputThaiAddress.Province
                    value={field.value ?? ''}
                    onChange={field.onChange}
                    onSelect={handleAddressAutoSelect}
                  />
                )}
              />
              <FieldError>{errors.province?.message}</FieldError>
            </Field>

            <Field>
              <Label>รหัสไปรษณีย์ *</Label>
              <Controller
                control={control}
                name="postalCode"
                render={({ field }) => (
                  <InputThaiAddress.Zipcode
                    value={field.value ?? ''}
                    onChange={field.onChange}
                    onSelect={handleAddressAutoSelect}
                  />
                )}
              />
              <FieldError>{errors.postalCode?.message}</FieldError>
            </Field>
          </FieldGroup>

          <DialogFooter className="flex flex-wrap border-t pt-5">
            <Button
              className="w-full"
              type="submit"
              size="lg"
              disabled={isPending}
            >
              {isPending ? (
                <>
                  <Spinner /> กำลังบันทึก...
                </>
              ) : (
                'บันทึกข้อมูลที่อยู่'
              )}
            </Button>
            <Button
              type="button"
              className="w-full"
              variant="outline"
              onClick={handleClose}
            >
              ยกเลิก
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
