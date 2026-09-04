'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'

import { useTranslations } from 'next-intl'

import { useBranches } from '@/actions/hooks/branch'
import { useCreateStockTransfer } from '@/actions/hooks/stock-transfer'
import { useStoreFilter } from '@/stores/use-store-filter'
import {
  CreateStockTransferFormValues,
  createStockTransferSchema,
} from '@/zod/stock-transfer'
import { zodResolver } from '@hookform/resolvers/zod'
import { IconPackageExport } from '@tabler/icons-react'

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Spinner } from '@/components/ui/spinner'
import { Textarea } from '@/components/ui/textarea'

interface StockTransferDialogProps {
  variantId: string
  variantLabel: string
  fromBranchId: string
  fromBranchName: string
}

export function StockTransferDialog({
  variantId,
  variantLabel,
  fromBranchId,
  fromBranchName,
}: StockTransferDialogProps) {
  const t = useTranslations('merchant.inventory')
  const { selectedStoreId } = useStoreFilter()
  const [open, setOpen] = useState(false)
  const createStockTransferMutation = useCreateStockTransfer()

  const { data: { data: branches = [] } = {} } = useBranches({
    storeId: selectedStoreId,
  })

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<CreateStockTransferFormValues>({
    resolver: zodResolver(createStockTransferSchema),
    defaultValues: {
      variantId,
      fromBranchId,
      toBranchId: '',
      quantity: 1,
      note: '',
    },
  })

  const handleClose = () => {
    reset()
    setOpen(false)
  }

  const onSubmit = (values: CreateStockTransferFormValues) => {
    createStockTransferMutation.mutate(
      { ...values, storeId: selectedStoreId },
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
          <IconPackageExport />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t('transfer.title')}</DialogTitle>
          <DialogDescription>{variantLabel}</DialogDescription>
        </DialogHeader>

        <div className="grid gap-4">
          <Field>
            <FieldLabel>{t('transfer.fromBranch')}</FieldLabel>
            <Input value={fromBranchName} disabled />
            <FieldError>{errors?.fromBranchId?.message}</FieldError>
          </Field>

          <Field>
            <FieldLabel>{t('transfer.toBranch')}</FieldLabel>
            <Select
              onValueChange={(v) =>
                setValue('toBranchId', v, { shouldValidate: true })
              }
              disabled={createStockTransferMutation.isPending}
            >
              <SelectTrigger>
                <SelectValue placeholder={t('transfer.selectToBranch')} />
              </SelectTrigger>
              <SelectContent>
                {branches
                  .filter((b) => b.id !== fromBranchId)
                  .map((branch) => (
                    <SelectItem key={branch.id} value={branch.id}>
                      {branch.name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
            <FieldError>{errors?.toBranchId?.message}</FieldError>
          </Field>

          <Field>
            <FieldLabel>{t('transfer.quantity')}</FieldLabel>
            <Input
              type="number"
              min={1}
              {...register('quantity', { valueAsNumber: true })}
              disabled={createStockTransferMutation.isPending}
            />
            <FieldError>{errors?.quantity?.message}</FieldError>
          </Field>

          <Field>
            <FieldLabel>{t('transfer.note')}</FieldLabel>
            <Textarea
              placeholder={t('transfer.notePlaceholder')}
              rows={2}
              {...register('note')}
              disabled={createStockTransferMutation.isPending}
            />
            <FieldError>{errors?.note?.message}</FieldError>
          </Field>
        </div>

        <DialogFooter className="mt-2 flex gap-2 border-t pt-4">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={createStockTransferMutation.isPending}
          >
            {t('cancel')}
          </Button>
          <Button
            onClick={handleSubmit(onSubmit)}
            disabled={createStockTransferMutation.isPending}
          >
            {createStockTransferMutation.isPending ? (
              <>
                <Spinner /> {t('transfer.transferring')}
              </>
            ) : (
              t('transfer.confirm')
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
