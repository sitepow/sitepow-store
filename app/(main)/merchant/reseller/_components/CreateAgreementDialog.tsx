'use client'

import { useEffect } from 'react'
import { FormProvider, SubmitHandler, useForm } from 'react-hook-form'

import { useTranslations } from 'next-intl'

import { useCreateResellerAgreement } from '@/actions/hooks/reseller'
import { ResellerType } from '@/generated/prisma/enums'
import { useCurrentStore } from '@/hooks/use-current-store'
import { useStoreFilter } from '@/stores/use-store-filter'
import { IconFileCertificate, IconX } from '@tabler/icons-react'

import { DialogHeaderIcon } from '@/components/DialogHeaderIcon'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
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
  const { currentStore, store } = useCurrentStore()
  const t = useTranslations('merchant.reseller.createAgreement')
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
            onSuccess?.(res.data.id)
            handleClose()
          }
        },
      },
    )
  }

  const isPending = createAgreementMutation.isPending

  return (
    <Dialog open={open} onOpenChange={(v) => (!v ? handleClose() : setOpen(v))}>
      <DialogContent
        style={
          {
            '--primary': currentStore?.primaryColor ?? store?.primaryColor,
          } as React.CSSProperties
        }
        className="max-h-[90vh] overflow-x-hidden overflow-y-auto sm:max-w-md"
      >
        <FormProvider {...methods}>
          <DialogHeader>
            <DialogHeaderIcon icon={IconFileCertificate} title={t('title')} />
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4">
            <Field>
              <FieldLabel>{t('resellerType')}</FieldLabel>
              <Select
                value={resellerType}
                onValueChange={(val: ResellerType) =>
                  setValue('resellerType', val, { shouldDirty: true })
                }
                disabled={isPending}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t('selectType')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ResellerType.EXTERNAL}>
                    {t('typeExternal')}
                  </SelectItem>
                  <SelectItem value={ResellerType.INTERNAL_STORE}>
                    {t('typeInternal')}
                  </SelectItem>
                </SelectContent>
              </Select>
            </Field>
            {resellerType === ResellerType.EXTERNAL ? (
              <Field>
                <FieldLabel>{t('customerId')}</FieldLabel>
                <Input
                  placeholder={t('customerIdPlaceholder')}
                  {...register('resellerCustomerId', {
                    required: t('customerIdRequired'),
                  })}
                  disabled={isPending}
                />
                <FieldError>{errors.resellerCustomerId?.message}</FieldError>
              </Field>
            ) : (
              <Field>
                <FieldLabel>{t('storeId')}</FieldLabel>
                <Input
                  placeholder={t('storeIdPlaceholder')}
                  {...register('resellerStoreId', {
                    required: t('storeIdRequired'),
                  })}
                  disabled={isPending}
                />
                <FieldError>{errors.resellerStoreId?.message}</FieldError>
              </Field>
            )}
            <Field>
              <FieldLabel>{t('commissionRate')}</FieldLabel>
              <Input
                type="number"
                step="0.01"
                placeholder={t('commissionRatePlaceholder')}
                {...register('commissionRate', {
                  valueAsNumber: true,
                  min: { value: 0, message: t('commissionNonNegative') },
                  max: { value: 100, message: t('commissionMax') },
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
