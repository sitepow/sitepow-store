'use client'

import { useEffect } from 'react'
import { Controller, useForm } from 'react-hook-form'

import {
  useBankAccount,
  useCreateBankAccount,
  useUpdateBankAccount,
} from '@/actions/store/payment/hooks'
import { OTHER_PAYMENT_METHODS, THAI_BANKS } from '@/constants/payment/bank'
import { BankAccountType } from '@/generated/prisma/enums'
import { useStoreFilter } from '@/stores/merchant/use-store-filter'
import { formatBankAccount, formatPromptPay } from '@/utils/formatting/promptpay-phone'
import { BankAccountFormValues, bankAccountSchema } from '@/zod/store/payment-settings'
import { zodResolver } from '@hookform/resolvers/zod'
import { Check, ChevronDownIcon } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Spinner } from '@/components/ui/spinner'
import { Switch } from '@/components/ui/switch'

import { cn } from '@/lib/utils'

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
    setValue,
    formState: { errors },
  } = useForm<BankAccountFormValues>({
    resolver: zodResolver(bankAccountSchema),
    defaultValues: DEFAULT_VALUES,
  })

  const accountType = watch('type')

  const bankOptions =
    accountType === BankAccountType.PROMPTPAY
      ? OTHER_PAYMENT_METHODS
      : THAI_BANKS

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
      <DialogContent className="overflow-hidden sm:max-w-lg">
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
          <div className="grid min-w-0 gap-4 py-2">
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
            <Field className="min-w-0">
              <FieldLabel>ประเภทบัญชี *</FieldLabel>
              <Controller
                control={control}
                name="type"
                render={({ field }) => (
                  <Select
                    value={field.value}
                    onValueChange={(val) => {
                      field.onChange(val)
                      setValue('bankName', '')
                    }}
                  >
                    <SelectTrigger className="w-full truncate">
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
            <Field className="min-w-0">
              <FieldLabel>ธนาคาร/ผู้ให้บริการ *</FieldLabel>
              <Controller
                control={control}
                name="bankName"
                render={({ field }) => {
                  return (
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          type="button"
                          className={cn(
                            'flex h-auto w-full min-w-0 items-center justify-between gap-1.5 px-3 py-2 text-sm font-normal',
                            !field.value && 'text-muted-foreground',
                          )}
                        >
                          <span className="min-w-0 flex-1 truncate text-left whitespace-pre-line">
                            {field.value
                              ? bankOptions.find((b) => b.name === field.value)
                                  ?.name || field.value
                              : 'เลือกธนาคาร...'}
                          </span>
                          <ChevronDownIcon className="text-muted-foreground pointer-events-none size-4 shrink-0" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent
                        className="w-(--radix-popover-trigger-width) min-w-(--radix-popover-trigger-width) p-0"
                        align="start"
                      >
                        <Command>
                          <CommandInput placeholder="ค้นหาธนาคารหรือผู้ให้บริการ..." />
                          <CommandList>
                            <CommandEmpty>ไม่พบข้อมูล</CommandEmpty>
                            <CommandGroup>
                              {bankOptions.map((bank) => (
                                <CommandItem
                                  key={bank.code}
                                  value={bank.name}
                                  onSelect={() => {
                                    field.onChange(bank.name)
                                  }}
                                >
                                  <Check
                                    className={cn(
                                      'mr-2 size-4 shrink-0',
                                      field.value === bank.name
                                        ? 'opacity-100'
                                        : 'opacity-0',
                                    )}
                                  />
                                  <span className="truncate">{bank.name}</span>
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                  )
                }}
              />
              <FieldError>{errors.bankName?.message}</FieldError>
            </Field>
            {accountType === BankAccountType.PROMPTPAY ? (
              <Field className="min-w-0">
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
              <Field className="min-w-0">
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
            <Field className="min-w-0">
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
