'use client'

import { useEffect, useState } from 'react'
import { useForm, useFormContext } from 'react-hook-form'
import toast from 'react-hot-toast'

import { useTranslations } from 'next-intl'

import { useCreateCustomer, useSearchCustomer } from '@/actions/hooks/customer'
import {
  useStorefrontLoyalty,
  useValidateCoupon,
} from '@/actions/hooks/storefront/discount'
import { useStoreFilter } from '@/stores/use-store-filter'
import { calculateMaxUsablePoints } from '@/utils/cart'
import { CreateCustomerInput, createCustomerSchema } from '@/zod/customer'
import { POSCheckoutInput } from '@/zod/order'
import { zodResolver } from '@hookform/resolvers/zod'

interface UsePosDiscountParams {
  subtotal: number
}

export function usePosDiscount({ subtotal }: UsePosDiscountParams) {
  const t = useTranslations('merchant.pos.discountDialog')
  const { selectedStoreId, selectedStoreSlug } = useStoreFilter()
  const { data: loyalty } = useStorefrontLoyalty(selectedStoreSlug)

  const [open, setOpen] = useState(false)
  const [mode, setMode] = useState<'search' | 'create'>('search')
  const [searchInput, setSearchInput] = useState('')
  const [inputCouponCode, setInputCouponCode] = useState('')

  const { watch, setValue } = useFormContext<POSCheckoutInput>()
  const customerId = watch('customerId')
  const customerPhone = watch('customerPhone')
  const customerPoints = watch('customerPoints') || 0
  const usedPoints = watch('usedPoints') || 0
  const couponCode = watch('couponCode')
  const couponDiscount = watch('couponDiscount') || 0

  const createForm = useForm<CreateCustomerInput>({
    resolver: zodResolver(createCustomerSchema),
  })

  const searchCustomerMutation = useSearchCustomer()
  const createCustomerMutation = useCreateCustomer()
  const validateCouponMutation = useValidateCoupon()

  const pointRedeemRate = loyalty?.pointRedeemRate ?? 0
  const isPointsEnabled = loyalty?.isPointsEnabled ?? false

  const maxUsablePoints = customerId
    ? calculateMaxUsablePoints(
        subtotal,
        couponDiscount,
        pointRedeemRate,
        customerPoints,
      )
    : 0

  const pointsDiscount = usedPoints * pointRedeemRate
  const totalDiscount = pointsDiscount + couponDiscount

  useEffect(() => {
    if (usedPoints > maxUsablePoints) {
      setValue('usedPoints', maxUsablePoints)
    }
  }, [maxUsablePoints, usedPoints, setValue])

  const handleSearchMember = () => {
    if (!searchInput.trim()) {
      toast.error(t('searchError'))
      return
    }

    if (!selectedStoreId) {
      return
    }

    const cleanQuery =
      searchInput.trim().replace(/\D/g, '') || searchInput.trim()

    searchCustomerMutation.mutate(
      { storeId: selectedStoreId, query: cleanQuery },
      {
        onSuccess: (data) => {
          if (data.success && data.data) {
            setValue('customerId', data.data.id)
            setValue('customerName', data.data.name)
            setValue('customerPhone', data.data.phone)
            setValue('customerPoints', data.data.points)
          }
        },
      },
    )
  }

  const handleCreateMember = (data: CreateCustomerInput) => {
    if (!selectedStoreId) {
      return
    }

    createCustomerMutation.mutate(
      {
        storeId: selectedStoreId,
        firstName: data.firstName.trim(),
        lastName: data.lastName?.trim() || undefined,
        phone: data.phone,
        email: data.email?.trim() || undefined,
      },
      {
        onSuccess: (res) => {
          if (res.success && res.data) {
            setValue('customerId', res.data.id)
            setValue('customerName', res.data.name)
            setValue('customerPhone', res.data.phone)
            setValue('customerPoints', res.data.points)
            createForm.reset()
            setMode('search')
          }
        },
      },
    )
  }

  const handleRemoveCustomer = () => {
    setValue('customerId', undefined)
    setValue('customerName', undefined)
    setValue('customerPhone', undefined)
    setValue('customerPoints', 0)
    setValue('usedPoints', 0)
    setSearchInput('')
  }

  const handleApplyCouponCode = () => {
    if (!inputCouponCode.trim()) {
      return
    }

    validateCouponMutation.mutate(
      {
        storeSlug: selectedStoreSlug,
        code: inputCouponCode.trim(),
        subtotal,
      },
      {
        onSuccess: (res) => {
          if (res.success && res.data) {
            setValue('couponCode', res.data.code)
            setValue('couponDiscount', res.data.discountAmount)
            setInputCouponCode('')
          }
        },
      },
    )
  }

  const handleRemoveCoupon = () => {
    setValue('couponCode', undefined)
    setValue('couponDiscount', 0)
  }

  return {
    open,
    setOpen,
    mode,
    setMode,
    searchInput,
    setSearchInput,
    inputCouponCode,
    setInputCouponCode,
    customerId,
    customerPhone,
    customerPoints,
    usedPoints,
    couponCode,
    couponDiscount,
    createForm,
    isPointsEnabled,
    pointRedeemRate,
    maxUsablePoints,
    pointsDiscount,
    totalDiscount,
    isSearching: searchCustomerMutation.isPending,
    isCreating: createCustomerMutation.isPending,
    isValidatingCoupon: validateCouponMutation.isPending,
    handleSearchMember,
    handleCreateMember,
    handleRemoveCustomer,
    handleApplyCouponCode,
    handleRemoveCoupon,
    setValue,
  }
}

