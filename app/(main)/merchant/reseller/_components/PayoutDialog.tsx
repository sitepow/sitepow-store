'use client'

import { useEffect } from 'react'
import { FormProvider, SubmitHandler, useForm } from 'react-hook-form'
import toast from 'react-hot-toast'

import { useR2DeleteImage, useR2UploadImage } from '@/actions/shared/r2/hooks'
import { useCreateResellerPayout } from '@/actions/reseller/reseller/hooks'
import { useResellerFilter } from '@/stores/merchant/use-reseller-filter'
import { useStoreFilter } from '@/stores/merchant/use-store-filter'
import { IconX } from '@tabler/icons-react'

import { FileUpload } from '@/components/form/FileUpload'
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
import { Spinner } from '@/components/ui/spinner'

interface PayoutFormValues {
  amount: number
  paymentProof: string | File
  note?: string
}

interface PayoutDialogProps {
  open: boolean
  setOpen: (v: boolean) => void
}

export function PayoutDialog({ open, setOpen }: PayoutDialogProps) {
  const { selectedStoreId } = useStoreFilter()
  const { selectedAgreementId: agreementId } = useResellerFilter()

  const createPayoutMutation = useCreateResellerPayout()

  const uploadMutation = useR2UploadImage(
    `store/${selectedStoreId}/reseller-payout`,
  )
  const deleteMutation = useR2DeleteImage()

  const methods = useForm<PayoutFormValues>({
    defaultValues: {
      amount: 0,
      paymentProof: '',
      note: '',
    },
  })

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = methods

  useEffect(() => {
    if (open) {
      reset({ amount: 0, paymentProof: '', note: '' })
    }
  }, [open, reset])

  const handleClose = () => {
    reset()
    setOpen(false)
  }

  const onSubmit: SubmitHandler<PayoutFormValues> = async (values) => {
    if (!agreementId) {
      return toast.error('ไม่พบข้อมูลสัญญาตัวแทน')
    }

    let imageUrl = ''

    if (values.paymentProof instanceof File) {
      const formData = new FormData()
      formData.append('file', values.paymentProof)
      const res = await uploadMutation.mutateAsync(formData)

      if (!res.success) {
        return toast.error('อัปโหลดหลักฐานการโอนเงินไม่สำเร็จ')
      }

      imageUrl = res.url ?? ''
    }

    createPayoutMutation.mutate(
      {
        agreementId,
        amount: Number(values.amount),
        paymentProof: imageUrl || undefined,
        note: values.note,
      },
      {
        onSuccess: (res) => {
          if (res.success) {
            toast.success(res.message || 'บันทึกรายการ Payout สำเร็จ')
            handleClose()
          } else {
            toast.error(res.message || 'เกิดข้อผิดพลาดในการบันทึก Payout')
          }
        },
      },
    )
  }

  const isPending =
    createPayoutMutation.isPending ||
    uploadMutation.isPending ||
    deleteMutation.isPending

  return (
    <Dialog open={open} onOpenChange={(v) => (!v ? handleClose() : setOpen(v))}>
      <DialogContent className="max-h-[90vh] overflow-x-hidden overflow-y-auto sm:max-w-lg">
        <FormProvider {...methods}>
          <DialogHeader>
            <DialogTitle>บันทึกการจ่ายเงินค่าคอมมิชชัน</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4">
            <Field>
              <FieldLabel>จำนวนเงินที่เคลียร์ / โอน (บาท)</FieldLabel>
              <Input
                type="number"
                step="0.01"
                placeholder="0.00"
                {...register('amount', {
                  valueAsNumber: true,
                  min: { value: 0.01, message: 'จำนวนเงินต้องมากกว่า 0' },
                })}
                disabled={isPending}
              />
              <FieldError>{errors.amount?.message}</FieldError>
            </Field>
            <Field>
              <FieldLabel>แนบหลักฐานการโอนเงิน (สลิป)</FieldLabel>
              <FileUpload name="paymentProof" />
              <FieldError>{errors.paymentProof?.message as string}</FieldError>
            </Field>
            <Field>
              <FieldLabel>หมายเหตุเพิ่มเติม</FieldLabel>
              <Input
                placeholder="รายละเอียดเพิ่มเติมเกี่ยวกับการโอนเงิน..."
                {...register('note')}
                disabled={isPending}
              />
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
                    <Spinner /> กำลังบันทึก...
                  </>
                ) : (
                  'ยืนยันชำระเงิน'
                )}
              </Button>
            </DialogFooter>
          </form>
        </FormProvider>
      </DialogContent>
    </Dialog>
  )
}
