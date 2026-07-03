'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'

import { useCreateStockAdjustment } from '@/actions/hooks/stock-adjustment'
import { STOCK_ADJUSTMENT_REASON_OPTIONS } from '@/constants/translate'
import { StockAdjustmentReason } from '@/generated/prisma/enums'
import { useStoreFilter } from '@/stores/use-store-filter'
import {
  CreateStockAdjustmentFormValues,
  createStockAdjustmentSchema,
} from '@/zod/stock-adjustment'
import { zodResolver } from '@hookform/resolvers/zod'
import { IconPackageImport } from '@tabler/icons-react'

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
  const { selectedStoreId } = useStoreFilter()
  const [open, setOpen] = useState(false)
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
      quantity: -1,
      reason: '',
      note: '',
    },
  })

  const handleClose = () => {
    reset()
    setOpen(false)
  }

  const onSubmit = (values: CreateStockAdjustmentFormValues) => {
    createStockAdjustmentMutation.mutate(
      {
        ...values,
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
          <DialogTitle>ปรับสต็อกสินค้า</DialogTitle>
          <DialogDescription>
            {variantLabel} · {branchName}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4">
          <Field>
            <FieldLabel>สาขา</FieldLabel>
            <Input value={branchName} disabled />
          </Field>

          <Field>
            <FieldLabel>จำนวน (ติดลบ = ตัดออก, บวก = เพิ่มเข้า)</FieldLabel>
            <Input
              type="number"
              {...register('quantity', { valueAsNumber: true })}
              disabled={createStockAdjustmentMutation.isPending}
            />
            <FieldError>{errors?.quantity?.message}</FieldError>
          </Field>

          <Field>
            <FieldLabel>เหตุผล</FieldLabel>
            <Select
              onValueChange={(v) =>
                setValue('reason', v, { shouldValidate: true })
              }
              disabled={createStockAdjustmentMutation.isPending}
            >
              <SelectTrigger>
                <SelectValue placeholder="เลือกเหตุผล" />
              </SelectTrigger>
              <SelectContent>
                {STOCK_ADJUSTMENT_REASON_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FieldError>{errors?.reason?.message}</FieldError>
          </Field>

          <Field>
            <FieldLabel>หมายเหตุ</FieldLabel>
            <Textarea
              placeholder="เช่น พบสินค้าแตกหัก 3 ชิ้นระหว่างตรวจนับ"
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
            ยกเลิก
          </Button>
          <Button
            onClick={handleSubmit(onSubmit)}
            disabled={createStockAdjustmentMutation.isPending}
          >
            {createStockAdjustmentMutation.isPending ? (
              <>
                <Spinner /> กำลังบันทึก...
              </>
            ) : (
              'ยืนยันการปรับสต็อก'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
