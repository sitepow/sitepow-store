'use client'

import { useEffect } from 'react'
import { FormProvider, SubmitHandler, useForm } from 'react-hook-form'
import toast from 'react-hot-toast'

import { useTranslations } from 'next-intl'

import { useBranchOptions } from '@/actions/hooks/branch'
import {
  useCreateExpense,
  useExpenses,
  useUpdateExpense,
} from '@/actions/hooks/expenses'
import { useR2DeleteImage, useR2UploadImage } from '@/actions/hooks/r2'
import { EXPENSE_CATEGORY_TH } from '@/constants/translate'
import { ExpenseCategory } from '@/generated/prisma/enums'
import { ALL_BRANCHES } from '@/stores/use-branch-filter'
import { useStoreFilter } from '@/stores/use-store-filter'
import { getPathR2FromUrl } from '@/utils/image'
import { ExpenseFormValues, createExpenseSchema } from '@/zod/expense'
import { zodResolver } from '@hookform/resolvers/zod'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Spinner } from '@/components/ui/spinner'
import { Textarea } from '@/components/ui/textarea'

const getTodayString = () => new Date().toISOString().split('T')[0]

const DEFAULT_VALUES = {
  title: '',
  amount: 0,
  category: ExpenseCategory.OTHER,
  branchId: null as string | null,
  receiptImage: '',
  note: '',
  expenseDate: getTodayString(),
}

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
  const tCategories = useTranslations('merchant.expenses.categories')
  const { selectedStoreId } = useStoreFilter()
  const createExpenseMutation = useCreateExpense()
  const updateExpenseMutation = useUpdateExpense()
  const uploadMutation = useR2UploadImage(`store/${selectedStoreId}/expense`)
  const deleteMutation = useR2DeleteImage()

  const { data: branches = [] } = useBranchOptions(selectedStoreId)
  const { data: { data: expenses = [] } = {} } = useExpenses({
    storeId: selectedStoreId,
    limit: 100,
  })

  const existingExpense = expenses.find((item) => item.id === expenseId)

  const methods = useForm<ExpenseFormValues>({
    resolver: zodResolver(createExpenseSchema),
    defaultValues: {
      ...DEFAULT_VALUES,
      storeId: selectedStoreId,
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

  useEffect(() => {
    if (open) {
      if (existingExpense) {
        reset({
          storeId: selectedStoreId,
          branchId: existingExpense.branchId || null,
          title: existingExpense.title,
          amount: Number(existingExpense.amount),
          category: existingExpense.category as ExpenseCategory,
          receiptImage: existingExpense.receiptImage || '',
          expenseDate: existingExpense.expenseDate
            ? new Date(existingExpense.expenseDate).toISOString().split('T')[0]
            : getTodayString(),
          note: existingExpense.note || '',
        })
      } else {
        reset({
          ...DEFAULT_VALUES,
          storeId: selectedStoreId,
          expenseDate: getTodayString(),
        })
      }
    }
  }, [open, existingExpense, selectedStoreId, reset])

  const handleClose = () => {
    reset()
    setOpen(false)
  }

  const onSubmit: SubmitHandler<ExpenseFormValues> = async (values) => {
    let imageUrl = values.receiptImage

    if (values.receiptImage === '' && existingExpense?.receiptImage) {
      const oldKey = getPathR2FromUrl(existingExpense.receiptImage)
      await deleteMutation.mutateAsync(oldKey)
      imageUrl = ''
    }

    if (values.receiptImage instanceof File) {
      if (existingExpense?.receiptImage) {
        const oldKey = getPathR2FromUrl(existingExpense.receiptImage)
        await deleteMutation.mutateAsync(oldKey)
      }

      const formData = new FormData()
      formData.append('file', values.receiptImage)
      const res = await uploadMutation.mutateAsync(formData)

      if (!res.success) {
        return toast.error(t('dialog.imageUploadError'))
      }

      imageUrl = res.url
    }

    const payload = {
      ...values,
      receiptImage: imageUrl,
      storeId: selectedStoreId,
    }

    if (expenseId) {
      updateExpenseMutation.mutate(
        { id: expenseId, ...payload },
        {
          onSuccess: (res) => {
            if (res.success) handleClose()
          },
        },
      )
    } else {
      createExpenseMutation.mutate(payload, {
        onSuccess: (res) => {
          if (res.success) handleClose()
        },
      })
    }
  }

  const isPending =
    createExpenseMutation.isPending ||
    updateExpenseMutation.isPending ||
    uploadMutation.isPending ||
    deleteMutation.isPending

  const currentCategory = watch('category')
  const currentBranchId = watch('branchId')
  const currentExpenseDate = watch('expenseDate')

  return (
    <Dialog open={open} onOpenChange={(v) => (!v ? handleClose() : setOpen(v))}>
      <DialogContent className="max-h-[90vh] overflow-x-hidden overflow-y-auto sm:max-w-lg">
        <FormProvider {...methods}>
          <DialogHeader>
            <DialogHeaderIcon
              icon={IconReceipt}
              title={
                expenseId ? t('dialog.editTitle') : t('dialog.createTitle')
              }
            />
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4">
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
            <Field>
              <FieldLabel>{t('dialog.categoryLabel')}</FieldLabel>
              <Select
                value={currentCategory}
                disabled={isPending}
                onValueChange={(val) =>
                  setValue('category', val as ExpenseCategory, {
                    shouldValidate: true,
                    shouldDirty: true,
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder={t('dialog.selectCategory')} />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(EXPENSE_CATEGORY_TH).map(([key, label]) => (
                    <SelectItem key={key} value={key}>
                      {tCategories.has(key as any)
                        ? tCategories(key as any)
                        : label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FieldError>{errors.category?.message}</FieldError>
            </Field>
            {branches.length > 0 && (
              <Field>
                <FieldLabel>{t('dialog.branchLabel')}</FieldLabel>
                <Select
                  value={currentBranchId || ALL_BRANCHES}
                  disabled={isPending}
                  onValueChange={(val) =>
                    setValue('branchId', val === ALL_BRANCHES ? null : val, {
                      shouldDirty: true,
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t('allBranches')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={ALL_BRANCHES}>
                      {t('allBranches')}
                    </SelectItem>
                    {branches.map((branch) => (
                      <SelectItem key={branch.id} value={branch.id}>
                        {branch.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
            )}
            <Field>
              <FieldLabel>{t('dialog.receiptImageLabel')}</FieldLabel>
              <FileUpload name="receiptImage" />
              <FieldError>{errors.receiptImage?.message as string}</FieldError>
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
