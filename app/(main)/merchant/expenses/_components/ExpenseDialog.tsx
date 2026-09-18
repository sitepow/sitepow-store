'use client'

import React from 'react'
import { FormProvider } from 'react-hook-form'

import { useTranslations } from 'next-intl'

import { IconReceipt, IconX } from '@tabler/icons-react'

import { DialogHeaderIcon } from '@/components/DialogHeaderIcon'
import { FileUpload } from '@/components/FileUpload'
import { Button } from '@/components/ui/button'
import { DatePicker } from '@/components/ui/date-picker'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
} from '@/components/ui/dialog'
import { Field, FieldError, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Spinner } from '@/components/ui/spinner'
import { Textarea } from '@/components/ui/textarea'

import { useExpenseDialogForm } from '../_hooks/use-expense-dialog-form'
import { ExpenseCategoryBranchSection } from './ExpenseCategoryBranchSection'

export function ExpenseDialog({
  expenseId,
  open,
  setOpen,
}: {
  expenseId?: string
  open: boolean
  setOpen: (v: boolean) => void
}) {
  const t = useTranslations('merchant.expenses')

  const {
    currentStore,
    store,
    methods,
    register,
    handleSubmit,
    reset,
    setValue,
    errors,
    isDirty,
    isPending,
    branches,
    currentCategory,
    currentBranchId,
    currentExpenseDate,
    handleClose,
  } = useExpenseDialogForm({
    expenseId,
    open,
    setOpen,
  })

  return (
    <Dialog open={open} onOpenChange={(v) => (!v ? handleClose() : setOpen(v))}>
      <DialogContent
        style={
          {
            '--primary': currentStore?.primaryColor ?? store?.primaryColor,
          } as React.CSSProperties
        }
        className="max-h-[90vh] overflow-x-hidden overflow-y-auto sm:max-w-lg"
      >
        <FormProvider {...methods}>
          <DialogHeader>
            <DialogHeaderIcon
              icon={IconReceipt}
              title={
                expenseId ? t('dialog.editTitle') : t('dialog.createTitle')
              }
            />
          </DialogHeader>
          <form onSubmit={handleSubmit} className="grid gap-4">
            <Field>
              <FieldLabel>{t('dialog.titleLabel')}</FieldLabel>
              <Textarea
                placeholder={t('dialog.titlePlaceholder')}
                {...register('title')}
                disabled={isPending}
              />
              <FieldError>{errors.title?.message}</FieldError>
            </Field>

            <div className="grid gap-3 sm:grid-cols-2">
              <Field>
                <FieldLabel>{t('dialog.amountLabel')}</FieldLabel>
                <Input
                  type="number"
                  step="0.01"
                  placeholder={t('dialog.amountPlaceholder')}
                  {...register('amount', { valueAsNumber: true })}
                  disabled={isPending}
                />
                <FieldError>{errors.amount?.message}</FieldError>
              </Field>

              <Field className="flex flex-col">
                <FieldLabel>{t('dialog.expenseDateLabel')}</FieldLabel>
                <DatePicker
                  value={currentExpenseDate}
                  onChange={(val) =>
                    setValue('expenseDate', val, {
                      shouldValidate: true,
                      shouldDirty: true,
                    })
                  }
                  disabled={isPending}
                />
                <FieldError>{errors.expenseDate?.message}</FieldError>
              </Field>
            </div>

            <ExpenseCategoryBranchSection
              currentCategory={currentCategory}
              onCategoryChange={(val) =>
                setValue('category', val, {
                  shouldValidate: true,
                  shouldDirty: true,
                })
              }
              categoryError={errors.category?.message}
              currentBranchId={currentBranchId}
              onBranchChange={(val) =>
                setValue('branchId', val, {
                  shouldDirty: true,
                })
              }
              branches={branches}
              isPending={isPending}
            />

            <Field>
              <FieldLabel>{t('dialog.receiptImageLabel')}</FieldLabel>
              <FileUpload name="receiptImage" />
              <FieldError>
                {typeof errors.receiptImage?.message === 'string'
                  ? errors.receiptImage.message
                  : undefined}
              </FieldError>
            </Field>

            <Field>
              <FieldLabel>{t('dialog.noteLabel')}</FieldLabel>
              <Input
                placeholder={t('dialog.notePlaceholder')}
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
                  {t('dialog.reset')}
                </Button>
              ) : (
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleClose}
                  disabled={isPending}
                >
                  {t('dialog.cancel')}
                </Button>
              )}
              <Button type="submit" disabled={isPending}>
                {isPending ? (
                  <>
                    <Spinner /> {t('dialog.saving')}
                  </>
                ) : (
                  t('dialog.save')
                )}
              </Button>
            </DialogFooter>
          </form>
        </FormProvider>
      </DialogContent>
    </Dialog>
  )
}
