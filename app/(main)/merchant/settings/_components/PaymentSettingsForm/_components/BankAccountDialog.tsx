'use client'

import { useCurrentStore } from '@/hooks/use-current-store'

import { useEffect } from 'react'
import { Controller, useForm } from 'react-hook-form'

import { useTranslations } from 'next-intl'

import {
  useBankAccount,
  useCreateBankAccount,
  useUpdateBankAccount,
} from '@/actions/hooks/payment'
import { OTHER_PAYMENT_METHODS, THAI_BANKS } from '@/constants/bank'
import { BankAccountType } from '@/generated/prisma/enums'
import { useStoreFilter } from '@/stores/use-store-filter'
import { formatBankAccount, formatPromptPay } from '@/utils/slip'
import { BankAccountFormValues, bankAccountSchema } from '@/zod/payment'
import { zodResolver } from '@hookform/resolvers/zod'
import { IconBuildingBank } from '@tabler/icons-react'
import { Check, ChevronDownIcon } from 'lucide-react'

import { DialogHeaderIcon } from '@/components/DialogHeaderIcon'
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
  DialogFooter,
  DialogHeader,
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
  const { currentStore, store } = useCurrentStore()
  const t = useTranslations('merchant.settings.payment.dialog')
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
      <DialogContent
        style={{
        '--primary': currentStore?.primaryColor ?? store?.primaryColor,
      } as React.CSSProperties} className="sm:max-w-lg">
        <DialogHeader>
          <DialogHeaderIcon
            icon={IconBuildingBank}
            title={bankAccountId ? t('editTitle') : t('addTitle')}
            description={t('description')}
          />
        </DialogHeader>
        {isLoadingAccount && bankAccountId ? (
          <div className="flex justify-center py-8">
            <Spinner /> {t('loading')}
          </div>
        ) : (
          <div className="grid min-w-0 gap-4 py-2">
            <div className="flex items-center justify-between rounded-lg border p-3">
              <div className="space-y-0.5">
                <span className="text-sm font-medium">{t('defaultLabel')}</span>
                <span className="text-muted-foreground block text-xs">
                  {t('defaultDesc')}
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
              <FieldLabel>{t('typeLabel')}</FieldLabel>
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
                      <SelectValue placeholder={t('typePlaceholder')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={BankAccountType.STANDARD_TRANSFER}>
                        {t('typeBank')}
                      </SelectItem>
                      <SelectItem value={BankAccountType.PROMPTPAY}>
                        {t('typePromptPay')}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </Field>
            <Field className="min-w-0">
              <FieldLabel>{t('bankLabel')}</FieldLabel>
              <Controller
                control={control}
                name="bankName"
                render={({ field }) => {
                  return (
                    <Popover>
                      <PopoverTrigger asChild>
                        <button
                          type="button"
                          className={cn(
                            'border-input bg-input/30 flex h-fit w-full min-w-0 items-center justify-between gap-1.5 rounded-2xl border px-3 py-2 text-sm transition-colors outline-none',
                            'focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]',
                            !field.value && 'text-muted-foreground',
                            'hover:bg-input/50',
                          )}
                        >
                          <span className="min-w-0 flex-1 truncate text-left whitespace-pre-line">
                            {field.value
                              ? bankOptions.find((b) => b.name === field.value)
                                  ?.name || field.value
                              : t('bankPlaceholder')}
                          </span>
                          <ChevronDownIcon className="text-muted-foreground pointer-events-none size-4 shrink-0" />
                        </button>
                      </PopoverTrigger>
                      <PopoverContent
                        className="w-(--radix-popover-trigger-width) min-w-(--radix-popover-trigger-width) p-0"
                        align="start"
                      >
                        <Command>
                          <CommandInput
                            placeholder={t('searchBankPlaceholder')}
                          />
                          <CommandList>
                            <CommandEmpty>{t('noBankFound')}</CommandEmpty>
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
                <FieldLabel>{t('promptPayIdLabel')}</FieldLabel>
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
                      placeholder={t('promptPayIdPlaceholder')}
                      inputMode="numeric"
                    />
                  )}
                />
                <FieldError>{errors.promptPayId?.message}</FieldError>
              </Field>
            ) : (
              <Field className="min-w-0">
                <FieldLabel>{t('accountNumberLabel')}</FieldLabel>
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
                      placeholder={t('accountNumberPlaceholder')}
                      inputMode="numeric"
                    />
                  )}
                />
                <FieldError>{errors.accountNumber?.message}</FieldError>
              </Field>
            )}
            <Field className="min-w-0">
              <FieldLabel>{t('accountNameLabel')}</FieldLabel>
              <Input
                {...register('accountName')}
                placeholder={t('accountNamePlaceholder')}
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
            {t('cancel')}
          </Button>
          <Button
            type="button"
            onClick={handleSubmit(onSubmit)}
            disabled={isPending}
          >
            {isPending ? <Spinner /> : t('save')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
