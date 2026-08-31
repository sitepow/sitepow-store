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
            <FieldLabel>ประเภทการปรับสต็อก</FieldLabel>
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
                ตัดออก (- ลดลง)
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
                เพิ่มเข้า (+ เพิ่มขึ้น)
              </Button>
            </div>
          </Field>
          <Field>
            <FieldLabel>จำนวน</FieldLabel>
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
            <FieldLabel>เหตุผล</FieldLabel>
            <Select
              defaultValue={StockAdjustmentReason.CORRECTION}
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
