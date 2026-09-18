'use client'

import { Controller, UseFormReturn } from 'react-hook-form'

import { useTranslations } from 'next-intl'

import { formatNumber } from '@/utils/pricing'
import { formatPhoneInput, formatPromptPay } from '@/utils/slip'
import { CreateCustomerInput } from '@/zod/customer'
import { IconPlus, IconSearch, IconUserPlus, IconX } from '@tabler/icons-react'

import { CustomerCard } from '@/components/CustomerCard'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

interface PosMemberSectionProps {
  customerId?: string
  customerPhone?: string
  customerPoints: number
  mode: 'search' | 'create'
  onModeChange: (mode: 'search' | 'create') => void
  searchInput: string
  onSearchInputChange: (val: string) => void
  onSearch: () => void
  isSearching: boolean
  isCreating: boolean
  onRemoveCustomer: () => void
  createForm: UseFormReturn<CreateCustomerInput>
  onCreateSubmit: (data: CreateCustomerInput) => void
}

export function PosMemberSection({
  customerId,
  customerPhone,
  customerPoints,
  mode,
  onModeChange,
  searchInput,
  onSearchInputChange,
  onSearch,
  isSearching,
  isCreating,
  onRemoveCustomer,
  createForm,
  onCreateSubmit,
}: PosMemberSectionProps) {
  const t = useTranslations('merchant.pos.discountDialog')
  const tPos = useTranslations('merchant.pos')
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = createForm

  return (
    <div className="space-y-3">
      {customerId ? (
        <>
          <div className="flex items-center justify-between">
            <Label className="flex items-center gap-1.5 text-sm font-semibold">
              <IconUserPlus className="text-primary size-4" />
              {t('memberLabel')}
            </Label>
          </div>
          <CustomerCard
            title={tPos('customerInfo')}
            content={
              <>
                {tPos('customerId', { id: customerId })} <br />
                {tPos('customerPhone', {
                  phone: formatPromptPay(customerPhone),
                })}{' '}
                <br />
                {tPos('customerPoints', {
                  points: formatNumber(customerPoints),
                })}
              </>
            }
            action={
              <Button variant="outline" size="icon" onClick={onRemoveCustomer}>
                <IconX />
              </Button>
            }
          />
        </>
      ) : (
        <Tabs
          value={mode}
          onValueChange={(val) => onModeChange(val as 'search' | 'create')}
          className="w-full space-y-3"
        >
          <div className="flex flex-wrap items-center justify-between">
            <Label className="flex items-center gap-1.5 text-sm font-semibold">
              <IconUserPlus className="text-primary size-4" />
              {t('memberLabel')}
            </Label>
            <TabsList className="h-8 p-0.5">
              <TabsTrigger value="search" className="text-xs">
                {t('searchTab')}
              </TabsTrigger>
              <TabsTrigger value="create" className="text-xs">
                {t('newMemberTab')}
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="search" className="mt-0">
            <div className="flex gap-2">
              <Input
                placeholder={t('searchPlaceholder')}
                value={searchInput}
                onChange={(e) => onSearchInputChange(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && onSearch()}
                className="h-10 text-sm"
              />
              <Button
                type="button"
                onClick={onSearch}
                disabled={isSearching}
                className="h-10 gap-1.5 px-4 font-medium"
              >
                <IconSearch className="size-4" />
                {isSearching ? t('searching') : t('search')}
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="create" className="mt-0">
            <form
              onSubmit={handleSubmit(onCreateSubmit)}
              className="bg-muted/30 space-y-3 rounded-xl border p-3.5"
            >
              <div className="grid gap-2 sm:grid-cols-2">
                <div className="space-y-1">
                  <Label className="text-xs">
                    {t('firstName')} <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    placeholder="John"
                    className="h-9 text-xs"
                    {...register('firstName')}
                  />
                  {errors.firstName && (
                    <p className="text-destructive text-[11px]">
                      {errors.firstName.message}
                    </p>
                  )}
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">{t('lastName')}</Label>
                  <Input
                    placeholder="Doe"
                    className="h-9 text-xs"
                    {...register('lastName')}
                  />
                  {errors.lastName && (
                    <p className="text-destructive text-[11px]">
                      {errors.lastName.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid gap-2 sm:grid-cols-2">
                <div className="space-y-1">
                  <Label className="text-xs">
                    {t('phone')} <span className="text-destructive">*</span>
                  </Label>
                  <Controller
                    name="phone"
                    control={control}
                    render={({ field: { onChange, value, ...field } }) => (
                      <Input
                        {...field}
                        placeholder="08X-XXX-XXXX"
                        className="h-9 text-xs"
                        value={value ?? ''}
                        onChange={(e) => {
                          const formatted = formatPhoneInput(e.target.value)
                          onChange(formatted)
                        }}
                      />
                    )}
                  />
                  {errors.phone && (
                    <p className="text-destructive text-[11px]">
                      {errors.phone.message}
                    </p>
                  )}
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">{t('email')}</Label>
                  <Input
                    type="email"
                    placeholder="customer@example.com"
                    className="h-9 text-xs"
                    {...register('email')}
                  />
                  {errors.email && (
                    <p className="text-destructive text-[11px]">
                      {errors.email.message}
                    </p>
                  )}
                </div>
              </div>

              <Button
                type="submit"
                disabled={isCreating}
                className="w-full gap-1.5 font-semibold"
                size="sm"
              >
                <IconPlus className="size-4" />
                {isCreating ? t('registering') : t('registerMember')}
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      )}
    </div>
  )
}
