'use client'

import { useEffect } from 'react'
import { Controller, useFieldArray, useForm, useWatch } from 'react-hook-form'

import { useTranslations } from 'next-intl'

import {
  useBranch,
  useCreateBranch,
  useUpdateBranch,
} from '@/actions/hooks/branch'
import { THAI_DAYS } from '@/constants/system'
import { useStoreFilter } from '@/stores/use-store-filter'
import { OpeningHours } from '@/types/branch'
import { CreateBranchFormValues, createBranchSchema } from '@/zod/branch'
import { zodResolver } from '@hookform/resolvers/zod'
import { IconBuildingStore, IconPlus } from '@tabler/icons-react'

import { CreateInput } from '@/components/AddressAutoField'
import { DialogHeaderIcon } from '@/components/DialogHeaderIcon'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Field, FieldError, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Spinner } from '@/components/ui/spinner'
import { Switch } from '@/components/ui/switch'

import { Address } from '@/lib/address/logic'

const InputThaiAddress = CreateInput()

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

export function BranchDialog({
  branchId,
  open,
  setOpen,
  onAdd,
}: {
  branchId?: string
  open: boolean
  setOpen: (v: boolean) => void
  onAdd?: () => void
}) {
  const t = useTranslations('merchant.branches')
  const tCommon = useTranslations('common.actions')
  const { selectedStoreId } = useStoreFilter()
  const createMutation = useCreateBranch()
  const updateMutation = useUpdateBranch()
  const { data: branchData } = useBranch(branchId!)

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    control,
    watch,
    formState: { errors },
  } = useForm<CreateBranchFormValues>({
    resolver: zodResolver(createBranchSchema),
    defaultValues: DEFAULT_VALUES,
  })

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
  }, [branchData, reset])

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

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button onClick={onAdd}>
          <IconPlus className="size-4" />
          {t('addBranch')}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogHeaderIcon
            icon={IconBuildingStore}
            title={branchId ? t('editBranch') : t('addBranch')}
            description={t('dialog.description')}
          />
        </DialogHeader>
        <div className="grid gap-4 py-2">
          <div className="flex items-center justify-between rounded-lg border p-3">
            <div className="space-y-0.5">
              <FieldLabel className="text-base">
                {t('dialog.isMainLabel')}
              </FieldLabel>
              <p className="text-muted-foreground text-xs">
                {t('dialog.isMainDesc')}
              </p>
            </div>
            <Controller
              control={control}
              name="isMain"
              render={({ field }) => (
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              )}
            />
          </div>

          <Field>
            <FieldLabel>{t('dialog.nameLabel')}</FieldLabel>
            <Input
              placeholder={t('dialog.namePlaceholder')}
              disabled
              {...register('name')}
            />
            <FieldError>{errors.name?.message}</FieldError>
          </Field>
          <Field>
            <FieldLabel>{t('dialog.addressLabel')}</FieldLabel>
            <Input
              placeholder={t('dialog.addressPlaceholder')}
              {...register('address')}
            />
            <FieldError>{errors.address?.message}</FieldError>
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field>
              <FieldLabel>{t('dialog.subDistrictLabel')}</FieldLabel>
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
              <FieldLabel>{t('dialog.districtLabel')}</FieldLabel>
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
              <FieldLabel>{t('dialog.provinceLabel')}</FieldLabel>
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
              <FieldLabel>{t('dialog.postcodeLabel')}</FieldLabel>
              <Controller
                control={control}
                name="postcode"
                render={({ field }) => (
                  <InputThaiAddress.Zipcode
                    value={field.value ?? ''}
                    onChange={field.onChange}
                    onSelect={handleAddressAutoSelect}
                  />
                )}
              />
              <FieldError>{errors.postcode?.message}</FieldError>
            </Field>
          </div>
        </div>
        {!!fields?.length && (
          <div className="space-y-3">
            <FieldLabel>{t('dialog.openingHoursLabel')}</FieldLabel>
            {fields.map((field, index) => {
              const isOpen = watch(`openingHours.${index}.isOpen`)

              return (
                <div
                  key={field.id}
                  className="border-border/50 grid grid-cols-2 gap-3 rounded-lg border p-3 sm:grid-cols-[80px_1fr_1fr_120px] sm:items-center sm:border-none sm:p-0"
                >
                  <span className="col-span-2 text-sm font-semibold sm:col-span-1 sm:font-medium">
                    {t.has(`dialog.days.${field.day}`)
                      ? t(`dialog.days.${field.day}`)
                      : field.day}
                  </span>
                  <Input
                    {...register(`openingHours.${index}.open`)}
                    type="time"
                    className="h-9"
                    disabled={!isOpen}
                  />
                  <Input
                    {...register(`openingHours.${index}.close`)}
                    type="time"
                    className="h-9"
                    disabled={!isOpen}
                  />
                  <div className="flex w-fit flex-col items-center gap-2">
                    <span className="text-muted-foreground text-xs">
                      {isOpen
                        ? t('dialog.openStatus')
                        : t('dialog.closedStatus')}
                    </span>
                    <Controller
                      control={control}
                      name={`openingHours.${index}.isOpen`}
                      render={({ field }) => (
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      )}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        )}

        <Field>
          <FieldLabel>{t('dialog.mapUrlLabel')}</FieldLabel>
          <Input
            placeholder={t('dialog.mapUrlPlaceholder')}
            {...register('mapUrl')}
          />
        </Field>
        {mapUrl && mapUrl.includes('google.com/maps') && (
          <div className="border-primary h-48 w-full overflow-hidden rounded-lg border">
            <iframe src={mapUrl} className="h-full w-full" loading="lazy" />
          </div>
        )}
        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isPending}>
            {tCommon('cancel')}
          </Button>
          <Button onClick={handleSubmit(onSubmit)} disabled={isPending}>
            {isPending ? <Spinner /> : tCommon('save')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
