'use client'

import { useEffect } from 'react'
import { SubmitHandler, useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { useTranslations } from 'next-intl'
import { zodResolver } from '@hookform/resolvers/zod'

import { useBranchOptions } from '@/actions/hooks/branch'
import {
  useCreateExpense,
  useExpenses,
  useUpdateExpense,
} from '@/actions/hooks/expenses'
import { useR2DeleteImage, useR2UploadImage } from '@/actions/hooks/r2'
import { ExpenseCategory } from '@/generated/prisma/enums'
import { useCurrentStore } from '@/hooks/use-current-store'
import { useStoreFilter } from '@/stores/use-store-filter'
import { getPathR2FromUrl } from '@/utils/image'
import { ExpenseFormValues, createExpenseSchema } from '@/zod/expense'

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

interface UseExpenseDialogFormProps {
  expenseId?: string
  open: boolean
  setOpen: (v: boolean) => void
}

export function useExpenseDialogForm({
  expenseId,
  open,
  setOpen,
}: UseExpenseDialogFormProps) {
  const { currentStore, store } = useCurrentStore()
  const t = useTranslations('merchant.expenses')
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

  return {
    currentStore,
    store,
    methods,
    register,
    handleSubmit: handleSubmit(onSubmit),
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
  }
}
