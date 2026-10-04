'use client'

import { useEffect } from 'react'
import { FormProvider, SubmitHandler, useForm } from 'react-hook-form'
import toast from 'react-hot-toast'

import { useBranchOptions } from '@/actions/store/branch/hooks'
import {
  useCreateExpense,
  useExpenses,
  useUpdateExpense,
} from '@/actions/finance/expense/hooks'
import { useR2DeleteImage, useR2UploadImage } from '@/actions/shared/r2/hooks'
import { EXPENSE_CATEGORY_TH } from '@/constants/i18n/translate'
import { ExpenseCategory } from '@/generated/prisma/enums'
import { ALL_BRANCHES } from '@/stores/use-branch-filter'
import { useStoreFilter } from '@/stores/use-store-filter'
import { getPathR2FromUrl } from '@/utils/media/image'
import { ExpenseFormValues, createExpenseSchema } from '@/zod/finance/expense'
import { zodResolver } from '@hookform/resolvers/zod'
import { IconX } from '@tabler/icons-react'

import { FileUpload } from '@/components/form/FileUpload'
import { Button } from '@/components/ui/button'
import { DatePicker } from '@/components/ui/date-picker'
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
        return toast.error('อัพโหลดรูปภาพไม่สำเร็จ')
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
            <DialogTitle>
              {expenseId ? 'แก้ไขรายการค่าใช้จ่าย' : 'เพิ่มรายการค่าใช้จ่าย'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4">
            <Field>
              <FieldLabel>รายการ / ชื่อค่าใช้จ่าย</FieldLabel>
              <Textarea
                placeholder="เช่น ค่าไฟประจำเดือน ม.ค."
                {...register('title')}
                disabled={isPending}
              />
              <FieldError>{errors.title?.message}</FieldError>
            </Field>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field>
                <FieldLabel>จำนวนเงิน (บาท)</FieldLabel>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  {...register('amount', { valueAsNumber: true })}
                  disabled={isPending}
                />
                <FieldError>{errors.amount?.message}</FieldError>
              </Field>
              <Field className="flex flex-col">
                <FieldLabel>วันที่จ่าย</FieldLabel>
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
              <FieldLabel>หมวดหมู่</FieldLabel>
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
                  <SelectValue placeholder="เลือกหมวดหมู่" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(EXPENSE_CATEGORY_TH).map(([key, label]) => (
                    <SelectItem key={key} value={key}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FieldError>{errors.category?.message}</FieldError>
            </Field>
            {branches.length > 0 && (
              <Field>
                <FieldLabel>สาขาที่รับผิดชอบ (ตัวเลือก)</FieldLabel>
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
                    <SelectValue placeholder="ทุกสาขา" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={ALL_BRANCHES}>ทุกสาขา</SelectItem>
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
              <FieldLabel>
                แนบรูปสลิป / ใบเสร็จ (ขนาดไฟล์สูงสุด 10 MB)
              </FieldLabel>
              <FileUpload name="receiptImage" />
              <FieldError>{errors.receiptImage?.message as string}</FieldError>
            </Field>
            <Field>
              <FieldLabel>หมายเหตุ</FieldLabel>
              <Input
                placeholder="รายละเอียดเพิ่มเติม..."
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
                  ล้างการตั้งค่า
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
                  'บันทึกข้อมูล'
                )}
              </Button>
            </DialogFooter>
          </form>
        </FormProvider>
      </DialogContent>
    </Dialog>
  )
}
