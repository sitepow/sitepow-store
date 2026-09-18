'use client'

import { useEffect } from 'react'
import { useFieldArray, useForm, useWatch } from 'react-hook-form'
import { useTranslations } from 'next-intl'
import { zodResolver } from '@hookform/resolvers/zod'

import {
  useBranch,
  useCreateBranch,
  useUpdateBranch,
} from '@/actions/hooks/branch'
import { THAI_DAYS } from '@/constants/system'
import { useCurrentStore } from '@/hooks/use-current-store'
import { Address } from '@/lib/address/logic'
import { useStoreFilter } from '@/stores/use-store-filter'
import { OpeningHours } from '@/types/branch'
import { CreateBranchFormValues, createBranchSchema } from '@/zod/branch'

const DEFAULT_VALUES = {
  isMain: false,
  name: '',
  address: '',
  subDistrict: '',
  district: '',
  province: '',
  postcode: '',
  mapUrl: '',
  openingHours: THAI_DAYS.map((day) => ({
    day,
    open: '09:00',
    close: '18:00',
    isOpen: true,
  })),
}

interface UseBranchDialogFormProps {
  branchId?: string
  open: boolean
  setOpen: (v: boolean) => void
}

export function useBranchDialogForm({
  branchId,
  open,
  setOpen,
}: UseBranchDialogFormProps) {
  const { currentStore, store } = useCurrentStore()
  const t = useTranslations('merchant.branches')
  const { selectedStoreId } = useStoreFilter()
  const createMutation = useCreateBranch()
  const updateMutation = useUpdateBranch()
  const { data: branchData } = useBranch(branchId!)

  const form = useForm<CreateBranchFormValues>({
    resolver: zodResolver(createBranchSchema),
    defaultValues: DEFAULT_VALUES,
  })

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    control,
    watch,
    formState: { errors },
  } = form

  const mapUrl = useWatch({ control, name: 'mapUrl' })
  const subDistrict = useWatch({ control, name: 'subDistrict' })
  const district = useWatch({ control, name: 'district' })
  const province = useWatch({ control, name: 'province' })

  useEffect(() => {
    if (subDistrict && district && province) {
      setValue(
        'name',
        `${t('dialog.branchNamePrefix')}${subDistrict} (${province}) - ${Date.now().toString().slice(-3)}`,
      )
    }
  }, [subDistrict, district, province, setValue, t])

  useEffect(() => {
    if (open) {
      if (branchData) {
        const dbOpeningHours =
          branchData.openingHours as unknown as OpeningHours[]

        reset({
          isMain: branchData.isMain ?? false,
          name: branchData.name ?? '',
          address: branchData.address ?? '',
          province: branchData.province ?? '',
          district: branchData.district ?? '',
          subDistrict: branchData.subDistrict ?? '',
          postcode: branchData.postcode ?? '',
          mapUrl: branchData.mapUrl ?? '',
          openingHours:
            (Array.isArray(dbOpeningHours) ? dbOpeningHours : null) ??
            DEFAULT_VALUES.openingHours,
        })
      } else {
        reset(DEFAULT_VALUES)
      }
    }
  }, [open, branchData, reset])

  const handleAddressAutoSelect = (selectedAddr: Address) => {
    setValue('subDistrict', selectedAddr.district)
    setValue('district', selectedAddr.amphoe)
    setValue('province', selectedAddr.province)
    setValue('postcode', selectedAddr.zipcode)
  }

  const handleClose = () => {
    reset()
    setOpen(false)
  }

  const onSubmit = (values: CreateBranchFormValues) => {
    const payload = { ...values, storeId: selectedStoreId }

    if (branchId) {
      updateMutation.mutate(
        { id: branchId, input: payload },
        { onSuccess: handleClose },
      )
    } else {
      createMutation.mutate(payload, { onSuccess: handleClose })
    }
  }

  const { fields } = useFieldArray({ control, name: 'openingHours' })
  const isPending = createMutation.isPending || updateMutation.isPending

  return {
    currentStore,
    store,
    form,
    register,
    control,
    watch,
    errors,
    fields,
    mapUrl,
    isPending,
    handleAddressAutoSelect,
    handleClose,
    handleSubmit: handleSubmit(onSubmit),
  }
}
