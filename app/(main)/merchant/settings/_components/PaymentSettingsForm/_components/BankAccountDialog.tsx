'use client'

import { useEffect } from 'react'
import { Controller, useForm } from 'react-hook-form'

import {
  useBankAccount,
  useCreateBankAccount,
  useUpdateBankAccount,
} from '@/actions/hooks/payment'
import { THAI_BANKS } from '@/constants/bank'
import { BankAccountType } from '@/generated/prisma/enums'
import { useStoreFilter } from '@/stores/use-store-filter'
import { formatBankAccount, formatPromptPay } from '@/utils/slip'
import { BankAccountFormValues, bankAccountSchema } from '@/zod/payment'
import { zodResolver } from '@hookform/resolvers/zod'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import { Switch } from '@/components/ui/switch'

const DEFAULT_VALUES: BankAccountFormValues = {
  type: BankAccountType.STANDARD_TRANSFER,
  bankName: '',
  accountNumber: '',
  accountName: '',
  promptPayId: '',
  qrImage: '',
  isDefault: false,
}

export function BankAccountDialog({
  bankAccountId,
  open,
  setOpen,
}: {
  bankAccountId?: string
  open: boolean
  setOpen: (v: boolean) => void
}) {
  const { selectedStoreId } = useStoreFilter()
  const createMutation = useCreateBankAccount()
  const updateMutation = useUpdateBankAccount()
  const { data: bankAccountData, isLoading: isLoadingAccount } = useBankAccount(
    bankAccountId!,
  )

  const {
    register,
    handleSubmit,
    reset,
    control,
    watch,
    formState: { errors },
  } = useForm<BankAccountFormValues>({
    resolver: zodResolver(bankAccountSchema),
    defaultValues: DEFAULT_VALUES,
  })

  const accountType = watch('type')

  useEffect(() => {
    if (bankAccountData) {
      reset({
        type: bankAccountData.type,
        bankName: bankAccountData.bankName ?? '',
        accountNumber: bankAccountData.accountNumber ?? '',
        accountName: bankAccountData.accountName ?? '',
        promptPayId: bankAccountData.promptPayId ?? '',
        qrImage: bankAccountData.qrImage ?? '',
        isDefault: bankAccountData.isDefault,
      })
    } else {
      reset(DEFAULT_VALUES)
    }
  }, [bankAccountData, reset])

  const handleClose = () => {
    reset()
    setOpen(false)
  }

  const onSubmit = (data: BankAccountFormValues) => {
    if (bankAccountId) {
      updateMutation.mutate(
        { id: bankAccountId, storeId: selectedStoreId, data },
        { onSuccess: handleClose },
      )
    } else {
      createMutation.mutate(
        { storeId: selectedStoreId, data },
        { onSuccess: handleClose },
      )
    }
  }

  const isPending = createMutation.isPending || updateMutation.isPending

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {bankAccountId ? 'แก้ไขบัญชีธนาคาร' : 'เพิ่มบัญชีธนาคาร'}
          </DialogTitle>
          <DialogDescription>
            กรอกข้อมูลบัญชีธนาคารหรือพร้อมเพย์สำหรับรับชำระเงินจากลูกค้า
          </DialogDescription>
        </DialogHeader>
        {isLoadingAccount && bankAccountId ? (
          <div className="flex justify-center py-8">
            <Spinner /> กำลังโหลดข้อมูล...
          </div>
        ) : (
          <div className="grid gap-4 py-2">
            <div className="flex items-center justify-between rounded-lg border p-3">
              <div className="space-y-0.5">
                <span className="text-sm font-medium">ตั้งเป็นบัญชีหลัก</span>
                <span className="text-muted-foreground block text-xs">
                  บัญชีนี้จะถูกเลือกเป็นค่าเริ่มต้นในการรับเงิน
                </span>
              </div>
              <Controller
                control={control}
                name="isDefault"
                render={({ field }) => (
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                )}
              />
            </div>
            <Field>
              <FieldLabel>ประเภทบัญชี *</FieldLabel>
              <Controller
                control={control}
                name="type"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="เลือกประเภท..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={BankAccountType.STANDARD_TRANSFER}>
                        โอนผ่านธนาคาร
                      </SelectItem>
                      <SelectItem value={BankAccountType.PROMPTPAY}>
                        พร้อมเพย์ (PromptPay)
                      </SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </Field>
            <Field>
              <FieldLabel>ธนาคาร/ผู้ให้บริการ *</FieldLabel>
              <Controller
                control={control}
                name="bankName"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
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
            {accountType === BankAccountType.PROMPTPAY ? (
              <Field>
                <FieldLabel>หมายเลขพร้อมเพย์ *</FieldLabel>
                <Controller
                  control={control}
                  name="promptPayId"
                  render={({ field }) => (
                    <Input
                      value={formatPromptPay(field.value)}
                      onChange={(e) => {
                        const rawValue = e.target.value.replace(/\D/g, '')
                        field.onChange(rawValue)
                      }}
                      placeholder="เบอร์โทรศัพท์ หรือ เลขบัตรประชาชน"
                      inputMode="numeric"
                    />
                  )}
                />
                <FieldError>{errors.promptPayId?.message}</FieldError>
              </Field>
            ) : (
              <Field>
                <FieldLabel>เลขบัญชี *</FieldLabel>
                <Controller
                  control={control}
                  name="accountNumber"
                  render={({ field }) => (
                    <Input
                      value={formatBankAccount(field.value)}
                      onChange={(e) => {
                        const rawValue = e.target.value.replace(/\D/g, '')
                        field.onChange(rawValue)
                      }}
                      placeholder="เลขบัญชีธนาคาร"
                      inputMode="numeric"
                    />
                  )}
                />
                <FieldError>{errors.accountNumber?.message}</FieldError>
              </Field>
            )}
            <Field>
              <FieldLabel>
                ชื่อบัญชี *สำคัญชื่อต้องตรงและพิมพ์ให้ถูกต้องเท่านั้น
                ไม่เช่นนั้นตรวจสลิปอัตโนมัติอาจจะไม่ผ่าน
              </FieldLabel>
              <Input
                {...register('accountName')}
                placeholder="ชื่อ-นามสกุล หรือชื่อบริษัท"
              />
              <FieldError>{errors.accountName?.message}</FieldError>
            </Field>
          </div>
        )}
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={isPending}
          >
            ยกเลิก
          </Button>
          <Button
            type="button"
            onClick={handleSubmit(onSubmit)}
            disabled={isPending}
          >
            {isPending ? <Spinner /> : 'บันทึกข้อมูล'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
