'use client'

import { useEffect } from 'react'
import { FormProvider, SubmitHandler, useForm } from 'react-hook-form'
import toast from 'react-hot-toast'

import { useCreateResellerAgreement } from '@/actions/reseller/reseller/hooks'
import { ResellerType } from '@/generated/prisma/enums'
import { useStoreFilter } from '@/stores/use-store-filter'
import { IconX } from '@tabler/icons-react'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Field, FieldError, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Spinner } from '@/components/ui/spinner'

interface AgreementFormValues {
  resellerType: ResellerType
  resellerStoreId?: string
  resellerCustomerId?: string
  commissionRate: number
}

interface CreateAgreementDialogProps {
  open: boolean
  setOpen: (v: boolean) => void
  onSuccess?: (newAgreementId: string) => void
}

export function CreateAgreementDialog({
  open,
  setOpen,
  onSuccess,
}: CreateAgreementDialogProps) {
  const { selectedStoreId } = useStoreFilter()
  const createAgreementMutation = useCreateResellerAgreement()

  const methods = useForm<AgreementFormValues>({
    defaultValues: {
      resellerType: ResellerType.EXTERNAL,
      resellerCustomerId: '',
      resellerStoreId: '',
      commissionRate: 10,
    },
  })

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isDirty },
  } = methods

  const resellerType = watch('resellerType')

  useEffect(() => {
    if (open) {
      reset({
        resellerType: ResellerType.EXTERNAL,
        resellerCustomerId: '',
        resellerStoreId: '',
        commissionRate: 10,
      })
    }
  }, [open, reset])

  const handleClose = () => {
    reset()
    setOpen(false)
  }

  const onSubmit: SubmitHandler<AgreementFormValues> = async (values) => {
    createAgreementMutation.mutate(
      {
        supplierStoreId: selectedStoreId,
        resellerType: values.resellerType,
        resellerCustomerId:
          values.resellerType === ResellerType.EXTERNAL
            ? values.resellerCustomerId
            : undefined,
        resellerStoreId:
          values.resellerType === ResellerType.INTERNAL_STORE
            ? values.resellerStoreId
            : undefined,
        commissionRate: Number(values.commissionRate),
      },
      {
        onSuccess: (res) => {
          if (res.success && res.data) {
            toast.success('สร้างสัญญาตัวแทนจำหน่ายสำเร็จ')
            onSuccess?.(res.data.id)
            handleClose()
          } else {
            toast.error(res.message || 'เกิดข้อผิดพลาดในการสร้างสัญญา')
          }
        },
      },
    )
  }

  const isPending = createAgreementMutation.isPending

  return (
    <Dialog open={open} onOpenChange={(v) => (!v ? handleClose() : setOpen(v))}>
      <DialogContent className="max-h-[90vh] overflow-x-hidden overflow-y-auto sm:max-w-md">
        <FormProvider {...methods}>
          <DialogHeader>
            <DialogTitle>สร้างสัญญาตัวแทนจำหน่ายใหม่</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4">
            <Field>
              <FieldLabel>ประเภทตัวแทน</FieldLabel>
              <Select
                value={resellerType}
                onValueChange={(val: ResellerType) =>
                  setValue('resellerType', val, { shouldDirty: true })
                }
                disabled={isPending}
              >
                <SelectTrigger>
                  <SelectValue placeholder="เลือกประเภทตัวแทน" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ResellerType.EXTERNAL}>
                    บุคคลธรรมดา / ตัวแทนภายนอก (Customer)
                  </SelectItem>
                  <SelectItem value={ResellerType.INTERNAL_STORE}>
                    ร้านค้าในระบบ (Store)
                  </SelectItem>
                </SelectContent>
              </Select>
            </Field>
            {resellerType === ResellerType.EXTERNAL ? (
              <Field>
                <FieldLabel>รหัสลูกค้า (Customer ID)</FieldLabel>
                <Input
                  placeholder="ระบุ Customer ID"
                  {...register('resellerCustomerId', {
                    required: 'กรุณาระบุ Customer ID',
                  })}
                  disabled={isPending}
                />
                <FieldError>{errors.resellerCustomerId?.message}</FieldError>
              </Field>
            ) : (
              <Field>
                <FieldLabel>รหัสร้านค้าตัวแทน (Store ID)</FieldLabel>
                <Input
                  placeholder="ระบุ Store ID ของตัวแทน"
                  {...register('resellerStoreId', {
                    required: 'กรุณาระบุ Store ID',
                  })}
                  disabled={isPending}
                />
                <FieldError>{errors.resellerStoreId?.message}</FieldError>
              </Field>
            )}
            <Field>
              <FieldLabel>ส่วนลด / คอมมิชชัน (%)</FieldLabel>
              <Input
                type="number"
                step="0.01"
                placeholder="10"
                {...register('commissionRate', {
                  valueAsNumber: true,
                  min: { value: 0, message: 'ต้องไม่ติดลบ' },
                  max: { value: 100, message: 'ต้องไม่เกิน 100%' },
                })}
                disabled={isPending}
              />
              <FieldError>{errors.commissionRate?.message}</FieldError>
            </Field>
            <DialogFooter className="gap-2">
              {isDirty ? (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => reset()}
                  disabled={isPending}
                >
                  <IconX className="size-4" />
                  ล้างข้อมูล
                </Button>
              ) : (
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleClose}
                  disabled={isPending}
                >
                  ยกเลิก
                </Button>
              )}
              <Button type="submit" disabled={isPending}>
                {isPending ? (
                  <>
                    <Spinner /> กำลังสร้าง...
                  </>
                ) : (
                  'สร้างสัญญา'
                )}
              </Button>
            </DialogFooter>
          </form>
        </FormProvider>
      </DialogContent>
    </Dialog>
  )
}
