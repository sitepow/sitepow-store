import { useEffect, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'

import {
  useCreateBankAccount,
  useUpdateBankAccount,
} from '@/actions/hooks/payment'
import { THAI_BANKS } from '@/constants/bank'
import { useStoreFilter } from '@/stores/use-store-filter'
import { BankAccountFormValues, bankAccountSchema } from '@/zod/payment'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Spinner } from '@/components/ui/spinner'

interface BankAccountDialogProps {
  defaultValues?: BankAccountFormValues & { id: string }
}

export function BankAccountDialog({ defaultValues }: BankAccountDialogProps) {
  const [open, setOpen] = useState(false)
  const { selectedStoreId } = useStoreFilter()

  const isEdit = !!defaultValues?.id

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm<BankAccountFormValues>({
    resolver: zodResolver(bankAccountSchema),
    defaultValues: defaultValues ?? { isDefault: false },
  })

  const { mutate: createAccount, isPending: isCreating } =
    useCreateBankAccount()
  const { mutate: updateAccount, isPending: isUpdating } =
    useUpdateBankAccount()
  const isPending = isCreating || isUpdating

  const handleClose = () => {
    reset()
    setOpen(false)
  }

  useEffect(() => {
    if (defaultValues) reset(defaultValues)
  }, [defaultValues, reset])

  const onSubmit = (data: BankAccountFormValues) => {
    if (isEdit) {
      updateAccount(
        { id: defaultValues.id, storeId: selectedStoreId, data },
        {
          onSuccess: () => {
            handleClose()
          },
        },
      )
    } else {
      createAccount(
        { storeId: selectedStoreId, data },
        {
          onSuccess: () => {
            handleClose()
          },
        },
      )
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) {
          handleClose()
        }

        setOpen(v)
      }}
    >
      <DialogTrigger asChild>
        <Button type="button" variant="outline">
          <IconPlus size={14} /> เพิ่มบัญชีธนาคาร
        </Button>
      </DialogTrigger>

      <DialogContent className="max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? 'แก้ไขบัญชีธนาคาร' : 'เพิ่มบัญชีธนาคาร'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Field>
            <FieldLabel>ธนาคาร</FieldLabel>
            <Controller
              control={control}
              name="bankName"
              render={({ field }) => (
                <Select
                  value={field.value}
                  onValueChange={(v) => field.onChange(v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="เลือกธนาคาร..." />
                  </SelectTrigger>
                  <SelectContent>
                    {THAI_BANKS.map((bank) => (
                      <SelectItem key={bank.code} value={bank.name}>
                        {bank.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            <FieldError>{errors.bankName?.message}</FieldError>
          </Field>

          <Field>
            <FieldLabel>เลขบัญชี</FieldLabel>
            <Input
              {...register('accountNumber')}
              placeholder="เลขบัญชีธนาคาร"
              inputMode="numeric"
            />
            <FieldError>{errors.accountNumber?.message}</FieldError>
          </Field>

          <Field>
            <FieldLabel>ชื่อบัญชี</FieldLabel>
            <Input
              {...register('accountName')}
              placeholder="ชื่อ-นามสกุลเจ้าของบัญชี หรือชื่อบริษัท"
            />
            <FieldError>{errors.accountName?.message}</FieldError>
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
                'บันทึก'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
