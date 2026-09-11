'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'

import { useTranslations } from 'next-intl'

import { useCreateStockAdjustment } from '@/actions/hooks/stock-adjustment'
import { StockAdjustmentReason } from '@/generated/prisma/enums'
import { useStoreFilter } from '@/stores/use-store-filter'
import {
  CreateStockAdjustmentFormValues,
  createStockAdjustmentSchema,
} from '@/zod/stock-adjustment'
import { zodResolver } from '@hookform/resolvers/zod'
import { IconPackageImport } from '@tabler/icons-react'

import { DialogHeaderIcon } from '@/components/DialogHeaderIcon'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTrigger,
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
import { Textarea } from '@/components/ui/textarea'

interface StockAdjustmentDialogProps {
  variantId: string
  variantLabel: string
  branchId: string
  branchName: string
}

export function StockAdjustmentDialog({
  variantId,
  variantLabel,
  branchId,
  branchName,
}: StockAdjustmentDialogProps) {
  const t = useTranslations('merchant.inventory')
  const { selectedStoreId } = useStoreFilter()
  const [open, setOpen] = useState(false)

  const [adjustmentType, setAdjustmentType] = useState<'ADD' | 'SUBTRACT'>(
    'SUBTRACT',
  )

  const createStockAdjustmentMutation = useCreateStockAdjustment()

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<CreateStockAdjustmentFormValues>({
    resolver: zodResolver(createStockAdjustmentSchema),
    defaultValues: {
      variantId,
      branchId,
      quantity: 1,
      reason: StockAdjustmentReason.CORRECTION,
      note: '',
    },
  })

  const handleClose = () => {
    reset({
      variantId,
      branchId,
      quantity: 1,
      reason: StockAdjustmentReason.CORRECTION,
      note: '',
    })
    setAdjustmentType('SUBTRACT')
    setOpen(false)
  }

  const onSubmit = (values: CreateStockAdjustmentFormValues) => {
    const finalQuantity =
      adjustmentType === 'SUBTRACT'
        ? -Math.abs(Number(values.quantity))
        : Math.abs(Number(values.quantity))

    createStockAdjustmentMutation.mutate(
      {
        ...values,
        quantity: finalQuantity,
        storeId: selectedStoreId,
        reason: values.reason as StockAdjustmentReason,
      },
      {
        onSuccess: () => {
          handleClose()
        },
      },
    )
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) {
          handleClose()
        } else {
          setOpen(v)
        }
      }}
    >
      <DialogTrigger asChild>
        <Button variant="outline" size="icon-lg">
          <IconPackageImport />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogHeaderIcon
            icon={IconPackageImport}
            title={t('adjustment.title')}
            description={`${variantLabel} · ${branchName}`}
          />
        </DialogHeader>
        <div className="grid gap-4">
          <Field>
            <FieldLabel>{t('adjustment.branch')}</FieldLabel>
            <Input value={branchName} disabled />
          </Field>
          <Field>
            <FieldLabel>{t('adjustment.type')}</FieldLabel>
            <div className="grid grid-cols-2 gap-2 text-white">
              <Button
                type="button"
                variant={adjustmentType === 'SUBTRACT' ? 'default' : 'outline'}
                className={
                  adjustmentType === 'SUBTRACT'
                    ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90'
                    : ''
                }
                onClick={() => setAdjustmentType('SUBTRACT')}
                disabled={createStockAdjustmentMutation.isPending}
              >
                {t('adjustment.subtract')}
              </Button>
              <Button
                type="button"
                variant={adjustmentType === 'ADD' ? 'default' : 'outline'}
                className={
                  adjustmentType === 'ADD'
                    ? 'bg-green-600 text-white hover:bg-green-700'
                    : ''
                }
                onClick={() => setAdjustmentType('ADD')}
                disabled={createStockAdjustmentMutation.isPending}
              >
                {t('adjustment.add')}
              </Button>
            </div>
          </Field>
          <Field>
            <FieldLabel>{t('adjustment.quantity')}</FieldLabel>
            <Input
              type="number"
              min="1"
              placeholder="0"
              {...register('quantity', { valueAsNumber: true })}
              disabled={createStockAdjustmentMutation.isPending}
            />
            <FieldError>{errors?.quantity?.message}</FieldError>
          </Field>
          <Field>
            <FieldLabel>{t('adjustment.reason')}</FieldLabel>
            <Select
              defaultValue={StockAdjustmentReason.CORRECTION}
              onValueChange={(v) =>
                setValue('reason', v, { shouldValidate: true })
              }
              disabled={createStockAdjustmentMutation.isPending}
            >
              <SelectTrigger>
                <SelectValue placeholder={t('adjustment.selectReason')} />
              </SelectTrigger>
              <SelectContent>
                {Object.values(StockAdjustmentReason).map((reason) => (
                  <SelectItem key={reason} value={reason}>
                    {t(`reasons.${reason}` as any)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FieldError>{errors?.reason?.message}</FieldError>
          </Field>
          <Field>
            <FieldLabel>{t('adjustment.note')}</FieldLabel>
            <Textarea
              placeholder={t('adjustment.notePlaceholder')}
              rows={2}
              {...register('note')}
              disabled={createStockAdjustmentMutation.isPending}
            />
            <FieldError>{errors?.note?.message}</FieldError>
          </Field>
        </div>
        <DialogFooter className="mt-2 flex gap-2 border-t pt-4">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={createStockAdjustmentMutation.isPending}
          >
            {t('cancel')}
          </Button>
          <Button
            onClick={handleSubmit(onSubmit)}
            disabled={createStockAdjustmentMutation.isPending}
          >
            {createStockAdjustmentMutation.isPending ? (
              <>
                <Spinner /> {t('saving')}
              </>
            ) : (
              t('adjustment.confirm')
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
