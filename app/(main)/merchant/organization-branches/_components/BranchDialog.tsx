'use client'

import { useEffect } from 'react'
import { Controller, useForm, useWatch } from 'react-hook-form'

import {
  useBranch,
  useCreateBranch,
  useUpdateBranch,
} from '@/actions/hooks/branch'
import { useStoreFilter } from '@/stores/use-store-filter'
import { CreateBranchFormValues, createBranchSchema } from '@/zod/branch'
import { zodResolver } from '@hookform/resolvers/zod'
import { IconPlus } from '@tabler/icons-react'

import { CreateInput } from '@/components/AddressAutoField'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Field, FieldError, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Spinner } from '@/components/ui/spinner'

import { Address } from '@/lib/address/logic'

const InputThaiAddress = CreateInput()
const DEFAULT_VALUES = {
  name: '',
  address: '',
  subDistrict: '',
  district: '',
  province: '',
  postcode: '',
}

export function BranchDialog({
  branchId,
  open,
  setOpen,
  onAdd,
}: {
  branchId?: string
  open: boolean
  setOpen: (v: boolean) => void
  onAdd?: () => void
}) {
  const { selectedStoreId } = useStoreFilter()
  const createMutation = useCreateBranch()
  const updateMutation = useUpdateBranch()
  const { data: branchData } = useBranch(branchId!)

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    control,
    formState: { errors },
  } = useForm<CreateBranchFormValues>({
    resolver: zodResolver(createBranchSchema),
    defaultValues: DEFAULT_VALUES,
  })

  const subDistrict = useWatch({ control, name: 'subDistrict' })
  const district = useWatch({ control, name: 'district' })
  const province = useWatch({ control, name: 'province' })

  useEffect(() => {
    if (subDistrict && district && province) {
      setValue(
        'name',
        `สาขา${subDistrict} (${province}) - ${Date.now().toString().slice(-3)}`,
      )
    }
  }, [subDistrict, district, province, setValue])

  useEffect(() => {
    if (branchData) {
      reset({
        name: branchData.name ?? '',
        address: branchData.address ?? '',
        province: branchData.province ?? '',
        district: branchData.district ?? '',
        subDistrict: branchData.subDistrict ?? '',
        postcode: branchData.postcode ?? '',
      })
    } else {
      reset(DEFAULT_VALUES)
    }
  }, [branchData, reset])

  const handleAddressAutoSelect = (selectedAddr: Address) => {
    setValue('subDistrict', selectedAddr.district)
    setValue('district', selectedAddr.amphoe)
    setValue('province', selectedAddr.province)
    setValue('postcode', selectedAddr.zipcode)
  }

  const handleClose = () => {
    reset()
    setOpen(false)
  }

  const onSubmit = (values: CreateBranchFormValues) => {
    const payload = { ...values, storeId: selectedStoreId }

    if (branchId) {
      updateMutation.mutate(
        { id: branchId, input: payload },
        { onSuccess: handleClose },
      )
    } else {
      createMutation.mutate(payload, { onSuccess: handleClose })
    }
  }

  const isPending = createMutation.isPending || updateMutation.isPending

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" onClick={onAdd}>
          <IconPlus className="mr-2 size-4" />
          เพิ่มสาขาใหม่
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>เพิ่มสาขาใหม่</DialogTitle>
          <DialogDescription>
            กรอกรายละเอียดสาขาเพื่อใช้ในการคำนวณค่าจัดส่งและตัดสต็อก
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-2">
          <Field>
            <FieldLabel>ชื่อสาขา *</FieldLabel>
            <Input
              placeholder="เช่น สาขาอุบลราชธานี"
              disabled
              {...register('name')}
            />
            <FieldError>{errors.name?.message}</FieldError>
          </Field>
          <Field>
            <FieldLabel>ที่อยู่โดยละเอียด *</FieldLabel>
            <Input
              placeholder="บ้านเลขที่, ถนน, หมู่บ้าน"
              {...register('address')}
            />
            <FieldError>{errors.address?.message}</FieldError>
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field>
              <FieldLabel>ตำบล / แขวง *</FieldLabel>
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
              <FieldLabel>อำเภอ / เขต *</FieldLabel>
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
              <FieldLabel>จังหวัด *</FieldLabel>
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
              <FieldLabel>รหัสไปรษณีย์ *</FieldLabel>
              <Controller
                control={control}
                name="postcode"
                render={({ field }) => (
                  <InputThaiAddress.Zipcode
                    value={field.value ?? ''}
                    onChange={field.onChange}
                    onSelect={handleAddressAutoSelect}
                  />
                )}
              />
              <FieldError>{errors.postcode?.message}</FieldError>
            </Field>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isPending}>
            ยกเลิก
          </Button>
          <Button onClick={handleSubmit(onSubmit)} disabled={isPending}>
            {isPending ? <Spinner /> : 'บันทึกข้อมูล'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
