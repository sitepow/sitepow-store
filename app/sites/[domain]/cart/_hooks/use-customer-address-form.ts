'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

import { useCreateAddress } from '@/actions/hooks/storefront/address'
import { AddressType, CountryCode } from '@/generated/prisma/enums'
import { Address } from '@/lib/address/logic'
import { useStoreData } from '@/stores/sites/use-store-data'
import { AddressSchema, addressSchema } from '@/zod/address'

export function useCustomerAddressForm() {
  const { store } = useStoreData()
  const [open, setOpen] = useState(false)
  const { mutate: createAddress, isPending } = useCreateAddress(
    store?.slug ?? '',
  )

  const form = useForm<AddressSchema>({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      country: CountryCode.TH,
      type: AddressType.SHIPPING,
      branchCode: '00000',
    },
  })

  const { reset, watch, setValue, handleSubmit } = form

  const type = watch('type')
  const country = watch('country')
  const isThai = country === CountryCode.TH
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
        country: data.country,
        subDistrict: data.subDistrict ?? null,
        district: data.district ?? null,
        phone: rawPhone,
        receiverName: data.receiverName ?? null,
        taxName: data.taxName ?? null,
        taxId: data.taxId ?? null,
        branchCode: data.branchCode ?? null,
      },
      { onSuccess: handleClose },
    )
  }

  return {
    store,
    open,
    setOpen,
    form,
    isPending,
    isThai,
    country,
    showShippingFields,
    showTaxFields,
    handleClose,
    handleAddressAutoSelect,
    handleSubmit: handleSubmit(onSubmit),
  }
}
