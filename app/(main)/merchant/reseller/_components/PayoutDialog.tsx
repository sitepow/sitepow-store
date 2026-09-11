'use client'

import { useCurrentStore } from '@/hooks/use-current-store'

import { useEffect } from 'react'
import { FormProvider, SubmitHandler, useForm } from 'react-hook-form'
import toast from 'react-hot-toast'

import { useTranslations } from 'next-intl'

import { useR2DeleteImage, useR2UploadImage } from '@/actions/hooks/r2'
import { useCreateResellerPayout } from '@/actions/hooks/reseller'
import { useResellerFilter } from '@/stores/use-reseller-filter'
import { useStoreFilter } from '@/stores/use-store-filter'
import { IconReceiptRefund, IconX } from '@tabler/icons-react'

import { DialogHeaderIcon } from '@/components/DialogHeaderIcon'
import { FileUpload } from '@/components/FileUpload'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
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
  const { currentStore, store } = useCurrentStore()
  const t = useTranslations('merchant.reseller.payout')
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
      return toast.error(t('toastNoAgreement'))
    }

    let imageUrl = ''

    if (values.paymentProof instanceof File) {
      const formData = new FormData()
      formData.append('file', values.paymentProof)
      const res = await uploadMutation.mutateAsync(formData)

      if (!res.success) {
        return toast.error(t('toastUploadError'))
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
            toast.success(res.message || t('toastSuccess'))
            handleClose()
          } else {
            toast.error(res.message || t('toastError'))
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
            <DialogHeaderIcon icon={IconReceiptRefund} title={t('title')} />
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4">
            <Field>
              <FieldLabel>{t('amountLabel')}</FieldLabel>
              <Input
                type="number"
                step="0.01"
                placeholder={t('amountPlaceholder')}
                {...register('amount', {
                  valueAsNumber: true,
                  min: { value: 0.01, message: t('amountMin') },
                })}
                disabled={isPending}
              />
              <FieldError>{errors.amount?.message}</FieldError>
            </Field>
            <Field>
              <FieldLabel>{t('proofLabel')}</FieldLabel>
              <FileUpload name="paymentProof" />
              <FieldError>{errors.paymentProof?.message as string}</FieldError>
            </Field>
            <Field>
              <FieldLabel>{t('noteLabel')}</FieldLabel>
              <Input
                placeholder={t('notePlaceholder')}
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
                  {t('reset')}
                </Button>
              ) : (
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleClose}
                  disabled={isPending}
                >
                  {t('cancel')}
                </Button>
              )}
              <Button type="submit" disabled={isPending}>
                {isPending ? (
                  <>
                    <Spinner /> {t('submitting')}
                  </>
                ) : (
                  t('submit')
                )}
              </Button>
            </DialogFooter>
          </form>
        </FormProvider>
      </DialogContent>
    </Dialog>
  )
}
