'use client'

import { useState } from 'react'
import { Controller, useForm } from 'react-hook-form'

import { useTranslations } from 'next-intl'

import { useCreateAddress } from '@/actions/hooks/storefront/address'
import { AddressType } from '@/generated/prisma/enums'
import { useStoreData } from '@/stores/sites/use-store-data'
import { formatPhoneInput } from '@/utils/slip'
import { AddressSchema, addressSchema } from '@/zod/address'
import { zodResolver } from '@hookform/resolvers/zod'
import { PlusIcon } from 'lucide-react'

import { CreateInput } from '@/components/AddressAutoField'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Field, FieldError, FieldGroup } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Separator } from '@/components/ui/separator'
import { Spinner } from '@/components/ui/spinner'

import { Address } from '@/lib/address/logic'

const InputThaiAddress = CreateInput()

export function CustomerAddressCreateDialog() {
  const t = useTranslations('customer.addresses')
  const tActions = useTranslations('common.actions')
  const { store } = useStoreData()

  const [open, setOpen] = useState(false)
  const { mutate: createAddress, isPending } = useCreateAddress(
    store?.slug ?? '',
  )

  const {
    register,
    handleSubmit,
    reset,
    watch,
    control,
    setValue,
    formState: { errors },
  } = useForm<AddressSchema>({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      type: AddressType.SHIPPING,
      branchCode: '00000',
    },
  })

  const type = watch('type')
  const showShippingFields =
    type === AddressType.SHIPPING || type === AddressType.BOTH
  const showTaxFields = type === AddressType.TAX || type === AddressType.BOTH

  const handleClose = () => {
    reset()
    setOpen(false)
  }

  const handleAddressAutoSelect = (selectedAddr: Address) => {
    setValue('subDistrict', selectedAddr.district)
    setValue('district', selectedAddr.amphoe)
    setValue('province', selectedAddr.province)
    setValue('postalCode', selectedAddr.zipcode)
  }

  const onSubmit = (data: AddressSchema) => {
    if (!store?.slug) return

    const rawPhone = data.phone ? data.phone.replace(/\D/g, '') : ''

    createAddress(
      {
        ...data,
        phone: rawPhone,
        receiverName: data.receiverName ?? null,
        taxName: data.taxName ?? null,
        taxId: data.taxId ?? null,
        branchCode: data.branchCode ?? null,
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
        <Button variant="outline">
          <PlusIcon className="mr-2 size-4" />
          <span>{t('addShippingTaxAddress')}</span>
        </Button>
      </DialogTrigger>
      <DialogContent
        className="sm:max-w-xl"
        style={{ '--primary': store?.primaryColor } as React.CSSProperties}
      >
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogHeader>
            <DialogTitle>{t('addAddress')}</DialogTitle>
          </DialogHeader>
          <FieldGroup className="grid grid-cols-2 gap-x-5 gap-y-4 py-4">
            <Field className="col-span-2">
              <Label>{t('addressLabel')}</Label>
              <Input
                {...register('name')}
                placeholder={t('addressLabelPlaceholder')}
              />
              <FieldError>{errors.name?.message}</FieldError>
            </Field>
            <Field className="col-span-2">
              <Label className="mb-3 block font-bold">
                {t('addressPurpose')}
              </Label>
              <Controller
                control={control}
                name="type"
                render={({ field }) => (
                  <RadioGroup
                    value={field.value}
                    onValueChange={field.onChange}
                    className="flex flex-wrap gap-4"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem
                        value={AddressType.SHIPPING}
                        id="shipping"
                      />
                      <Label
                        htmlFor="shipping"
                        className="cursor-pointer font-normal"
                      >
                        {t('shippingOnly')}
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value={AddressType.TAX} id="tax" />
                      <Label
                        htmlFor="tax"
                        className="cursor-pointer font-normal"
                      >
                        {t('taxOnly')}
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value={AddressType.BOTH} id="both" />
                      <Label
                        htmlFor="both"
                        className="cursor-pointer font-normal"
                      >
                        {t('bothShippingTax')}
                      </Label>
                    </div>
                  </RadioGroup>
                )}
              />
            </Field>
            <Separator className="col-span-2" />
            {showShippingFields && (
              <Field className="col-span-2">
                <Label>{t('recipientNameRequired')}</Label>
                <Input
                  {...register('receiverName')}
                  placeholder={t('recipientPlaceholder')}
                />
                <FieldError>{errors.receiverName?.message}</FieldError>
              </Field>
            )}
            {showTaxFields && (
              <div className="bg-muted/30 border-primary col-span-2 grid grid-cols-12 gap-4 rounded-lg border border-dashed p-4">
                <div className="text-muted-foreground col-span-12 text-sm font-semibold">
                  {t('taxInfo')}
                </div>
                <Field className="col-span-12">
                  <Label>{t('taxPayerName')}</Label>
                  <Input
                    {...register('taxName')}
                    placeholder={t('taxPayerPlaceholder')}
                  />
                  <FieldError>{errors.taxName?.message}</FieldError>
                </Field>
                <Field className="col-span-8">
                  <Label>{t('taxId')}</Label>
                  <Input
                    {...register('taxId')}
                    placeholder={t('taxIdPlaceholder')}
                    maxLength={13}
                  />
                  <FieldError>{errors.taxId?.message}</FieldError>
                </Field>
                <Field className="col-span-4">
                  <Label>{t('branchCode')}</Label>
                  <Input
                    {...register('branchCode')}
                    placeholder="00000"
                    maxLength={5}
                  />
                  <FieldError>{errors.branchCode?.message}</FieldError>
                </Field>
              </div>
            )}
            <Field className="col-span-2">
              <Label>{t('phoneRequired')}</Label>
              <Controller
                name="phone"
                control={control}
                render={({ field: { onChange, value, ...field } }) => (
                  <Input
                    {...field}
                    value={value ?? ''}
                    placeholder="08X-XXX-XXXX"
                    onChange={(e) => {
                      const formatted = formatPhoneInput(e.target.value)
                      onChange(formatted)
                    }}
                  />
                )}
              />
              <FieldError>{errors.phone?.message}</FieldError>
            </Field>
            <Field className="col-span-2">
              <Label>{t('addressLineRequired')}</Label>
              <Input
                {...register('addressLine')}
                placeholder={t('addressLinePlaceholder')}
              />
              <FieldError>{errors.addressLine?.message}</FieldError>
            </Field>
            <Field>
              <Label>{t('subDistrictRequired')}</Label>
              <Controller
                control={control}
                name="subDistrict"
                render={({ field }) => (
                  <InputThaiAddress.District
                    value={field.value ?? ''}
                    onChange={field.onChange}
                    onSelect={handleAddressAutoSelect}
                  />
                )}
              />
              <FieldError>{errors.subDistrict?.message}</FieldError>
            </Field>
            <Field>
              <Label>{t('districtRequired')}</Label>
              <Controller
                control={control}
                name="district"
                render={({ field }) => (
                  <InputThaiAddress.Amphoe
                    value={field.value ?? ''}
                    onChange={field.onChange}
                    onSelect={handleAddressAutoSelect}
                  />
                )}
              />
              <FieldError>{errors.district?.message}</FieldError>
            </Field>
            <Field>
              <Label>{t('provinceRequired')}</Label>
              <Controller
                control={control}
                name="province"
                render={({ field }) => (
                  <InputThaiAddress.Province
                    value={field.value ?? ''}
                    onChange={field.onChange}
                    onSelect={handleAddressAutoSelect}
                  />
                )}
              />
              <FieldError>{errors.province?.message}</FieldError>
            </Field>
            <Field>
              <Label>{t('postalCodeRequired')}</Label>
              <Controller
                control={control}
                name="postalCode"
                render={({ field }) => (
                  <InputThaiAddress.Zipcode
                    value={field.value ?? ''}
                    onChange={field.onChange}
                    onSelect={handleAddressAutoSelect}
                  />
                )}
              />
              <FieldError>{errors.postalCode?.message}</FieldError>
            </Field>
          </FieldGroup>
          <DialogFooter className="flex flex-wrap border-t pt-5">
            <Button
              className="w-full"
              type="submit"
              size="lg"
              disabled={isPending || !store?.slug}
            >
              {isPending ? (
                <>
                  <Spinner /> {tActions('saving')}
                </>
              ) : (
                t('saveAddressButton')
              )}
            </Button>
            <Button
              type="button"
              className="w-full"
              variant="outline"
              onClick={handleClose}
            >
              {tActions('cancel')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
