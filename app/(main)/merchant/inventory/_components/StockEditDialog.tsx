'use client'

import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'

import { useUpdateStock } from '@/actions/inventory/stock/hooks'
import { GetInventoryItem } from '@/actions/inventory/stock/actions'
import { DecimalToNumber } from '@/utils/shared/decimal'
import { UpdateStockFormValues, updateStockSchema } from '@/zod/inventory/stock-update'
import { zodResolver } from '@hookform/resolvers/zod'
import { IconSettings } from '@tabler/icons-react'

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
import { Spinner } from '@/components/ui/spinner'

type ProductItem = DecimalToNumber<GetInventoryItem>
type StockItem = ProductItem['variants'][number]['stocks'][number]

interface StockEditDialogProps {
  stock: StockItem
  productTitle?: string
  variantTitle?: string
}

export function StockEditDialog({
  stock,
  productTitle = '',
  variantTitle = '',
}: StockEditDialogProps) {
  const [open, setOpen] = useState(false)
  const updateStockMutation = useUpdateStock()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<UpdateStockFormValues>({
    resolver: zodResolver(updateStockSchema),
    defaultValues: {
      minStock: stock?.minStock ?? 0,
    },
  })

  useEffect(() => {
    if (open) {
      reset({
        minStock: stock?.minStock ?? 0,
      })
    }
  }, [open, stock, reset])

  const handleClose = () => {
    reset()
    setOpen(false)
  }

  const onSubmit = (values: UpdateStockFormValues) => {
    if (!stock?.id) return

    updateStockMutation.mutate(
      { id: stock.id, input: values },
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
          <IconSettings />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>แก้ไขสต็อกสินค้า</DialogTitle>
          <DialogDescription>
            {productTitle} {variantTitle ? `· ${variantTitle}` : ''}{' '}
            {stock?.branch?.name ? `· ${stock.branch.name}` : ''}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4">
          <Field>
            <FieldLabel>จำนวนขั้นต่ำ (แจ้งเตือนเมื่อสต็อกต่ำกว่า)</FieldLabel>
            <Input
              type="number"
              min={0}
              {...register('minStock', { valueAsNumber: true })}
              disabled={updateStockMutation.isPending}
            />
            <FieldError>{errors?.minStock?.message}</FieldError>
          </Field>
        </div>
        <DialogFooter className="mt-2 flex gap-2 border-t pt-4">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={updateStockMutation.isPending}
          >
            ยกเลิก
          </Button>
          <Button
            onClick={handleSubmit(onSubmit)}
            disabled={updateStockMutation.isPending}
          >
            {updateStockMutation.isPending ? (
              <>
                <Spinner /> กำลังบันทึก...
              </>
            ) : (
              'บันทึก'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
