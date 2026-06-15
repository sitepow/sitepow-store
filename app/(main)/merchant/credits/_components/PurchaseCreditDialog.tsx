'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'

import { usePurchaseCredit } from '@/actions/hooks/credit'
import { EXCHANGE_RATE, PACKAGES } from '@/constants/credit'
import { ALL_STORES, useStoreFilter } from '@/stores/use-store-filter'
import { formatNumber } from '@/utils/pricing'
import { PurchaseCreditSchema, purchaseCreditSchema } from '@/zod/credit'
import { zodResolver } from '@hookform/resolvers/zod'
import { IconCoins, IconPlus } from '@tabler/icons-react'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Field, FieldError, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Spinner } from '@/components/ui/spinner'

export function PurchaseCreditDialog() {
  const [open, setOpen] = useState(false)
  const { selectedStoreId } = useStoreFilter()
  const { mutate: purchase, isPending } = usePurchaseCredit()

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<PurchaseCreditSchema>({
    resolver: zodResolver(purchaseCreditSchema),
    defaultValues: { amount: 100, description: '' },
  })

  const amount = watch('amount') || 0

  const handleClose = () => {
    reset()
    setOpen(false)
  }

  const onSubmit = (data: PurchaseCreditSchema) => {
    if (selectedStoreId === ALL_STORES) return

    purchase(
      {
        storeId: selectedStoreId,
        amount: data.amount,
        description: data.description,
      },
      { onSuccess: handleClose },
    )
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) handleClose()
        setOpen(v)
      }}
    >
      <DialogTrigger asChild>
        <Button>
          <IconPlus size={16} /> ซื้อเครดิต
        </Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>ซื้อเครดิตสำหรับใช้งาน AI</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-2">
            <FieldLabel>เลือกแพ็กเกจ</FieldLabel>
            <div className="grid grid-cols-3 gap-2">
              {PACKAGES.map((pkg) => (
                <Button
                  key={pkg}
                  type="button"
                  variant={amount === pkg ? 'default' : 'outline'}
                  onClick={() => setValue('amount', pkg)}
                >
                  {formatNumber(pkg)} บาท
                </Button>
              ))}
            </div>
          </div>

          <Field>
            <FieldLabel>หรือระบุจำนวนเงิน (บาท)</FieldLabel>
            <Input
              type="number"
              {...register('amount', { valueAsNumber: true })}
              placeholder="ระบุจำนวนเงิน"
            />
            <FieldError>{errors.amount?.message}</FieldError>
          </Field>

          <div className="bg-muted/50 flex items-center justify-between rounded-lg border p-4">
            <div className="flex items-center gap-2 text-sm">
              <IconCoins className="text-primary" size={20} />
              <span className="font-medium">จะได้รับเครดิต:</span>
            </div>
            <span className="text-primary text-xl font-bold">
              {Math.floor(amount * EXCHANGE_RATE)} Credits
            </span>
          </div>

          <Field>
            <FieldLabel>หมายเหตุ (ไม่บังคับ)</FieldLabel>
            <Input
              {...register('description')}
              placeholder="เช่น เติมเครดิตเพื่อจ่ายค่า AI"
            />
          </Field>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              ยกเลิก
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? (
                <>
                  <Spinner /> กำลังทำรายการ...
                </>
              ) : (
                'ยืนยันการซื้อ'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
