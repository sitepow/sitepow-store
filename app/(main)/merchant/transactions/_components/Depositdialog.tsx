'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'

import { useDepositBalance } from '@/actions/hooks/deposit'
import { ALL_STORES, useStoreFilter } from '@/stores/use-store-filter'
import { DepositSchema, depositSchema } from '@/zod/deposit'
import { zodResolver } from '@hookform/resolvers/zod'
import { IconPlus } from '@tabler/icons-react'

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

export function DepositDialog() {
  const [open, setOpen] = useState(false)
  const { selectedStoreId } = useStoreFilter()
  const { mutate: deposit, isPending } = useDepositBalance()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<DepositSchema>({
    resolver: zodResolver(depositSchema),
    defaultValues: { amount: 20, description: '' },
  })

  const handleClose = () => {
    reset()
    setOpen(false)
  }

  const onSubmit = (data: DepositSchema) => {
    if (selectedStoreId === ALL_STORES) {
      return
    }

    deposit(
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
          <IconPlus size={14} /> เติมเงิน Wallet
        </Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>เติมเงิน Wallet</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Field>
            <FieldLabel>จำนวนเงิน (บาท)</FieldLabel>
            <Input
              type="number"
              {...register('amount', { valueAsNumber: true })}
              placeholder="ขั้นต่ำ 20 บาท"
              inputMode="numeric"
              min={20}
            />
            <FieldError>{errors.amount?.message}</FieldError>
          </Field>

          <Field>
            <FieldLabel>หมายเหตุ (ไม่บังคับ)</FieldLabel>
            <Input
              {...register('description')}
              placeholder="เช่น เติมเงินเพื่อจ่ายค่าขนส่ง"
            />
            <FieldError>{errors.description?.message}</FieldError>
          </Field>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              ยกเลิก
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? (
                <>
                  <Spinner /> กำลังบันทึก...
                </>
              ) : (
                'เติมเงิน'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
