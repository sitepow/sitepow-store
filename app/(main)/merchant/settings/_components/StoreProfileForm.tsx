'use client'

import { useCurrentStore } from '@/hooks/use-current-store'
/* eslint-disable jsx-a11y/alt-text */
/* eslint-disable @next/next/no-img-element */

import { useCallback, useEffect, useMemo, useRef } from 'react'
import { Controller, useForm } from 'react-hook-form'

import { useTranslations } from 'next-intl'

import { useR2DeleteImage, useR2UploadImage } from '@/actions/hooks/r2'
import {
  useStoreProfile,
  useUpdateStoreProfile,
} from '@/actions/hooks/store-profile'
import { PRIMARY_COLOR_OPTIONS } from '@/constants/system'
import { ALL_STORES, useStoreFilter } from '@/stores/use-store-filter'
import { getPathR2FromUrl } from '@/utils/image'
import { StoreProfileFormValues, storeProfileSchema } from '@/zod/store-profile'
import { zodResolver } from '@hookform/resolvers/zod'
import { IconBuildingStore, IconSearch } from '@tabler/icons-react'

import { ActionRequiredAlert } from '@/components/ActionRequiredAlert'
import { PageTabHeader } from '@/components/PageTabHeader'
import { StoreLogo } from '@/components/StoreLogo'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Spinner } from '@/components/ui/spinner'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'

export function StoreProfileForm() {
  const { currentStore, store } = useCurrentStore()
  const t = useTranslations('merchant.settings.storeProfile')
  const { selectedStoreId } = useStoreFilter()
  const { data: storeProfile } = useStoreProfile(selectedStoreId as string)
  const profileMutation = useUpdateStoreProfile()

  const uploadLogoMutation = useR2UploadImage(`store/${selectedStoreId}/logo`)
  const uploadBannerMutation = useR2UploadImage(
    `store/${selectedStoreId}/banner`,
  )
  const deleteMutation = useR2DeleteImage()

  const logoInputRef = useRef<HTMLInputElement>(null)
  const bannerInputRef = useRef<HTMLInputElement>(null)

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    control,
    watch,
    formState: { isDirty, errors },
  } = useForm<StoreProfileFormValues>({
    resolver: zodResolver(storeProfileSchema),
    defaultValues: {
      name: '',
      slug: '',
      email: '',
      taxId: '',
      logo: '',
      coverImage: '',
      primaryColor: '',
      description: '',
      allowSearchEngineIndex: true,
      seoTitle: '',
      seoDescription: '',
      seoKeywords: '',
    },
  })

  const logo = watch('logo')
  const coverImage = watch('coverImage')

  const isVideo =
    (coverImage instanceof File && coverImage.type.startsWith('video/')) ||
    (typeof coverImage === 'string' && coverImage.match(/\.(mp4|webm|ogg)$/i))

  const previewLogoUrl = useMemo(() => {
    if (logo instanceof File) {
      return URL.createObjectURL(logo)
    }

    return logo
  }, [logo])

  useEffect(() => {
    return () => {
      if (previewLogoUrl?.startsWith('blob:')) {
        URL.revokeObjectURL(previewLogoUrl)
      }
    }
  }, [previewLogoUrl])

  const previewBannerUrl = useMemo(() => {
    if (coverImage instanceof File) {
      return URL.createObjectURL(coverImage)
    }

    return coverImage
  }, [coverImage])

  useEffect(() => {
    return () => {
      if (previewBannerUrl?.startsWith('blob:')) {
        URL.revokeObjectURL(previewBannerUrl)
      }
    }
  }, [previewBannerUrl])

  const resetForm = useCallback(() => {
    if (storeProfile) {
      reset({
        ...storeProfile,
        email: storeProfile.email ?? '',
        taxId: storeProfile.taxId ?? '',
        description: storeProfile.description ?? '',
        primaryColor: storeProfile.primaryColor ?? '',
        allowSearchEngineIndex: storeProfile.allowSearchEngineIndex ?? true,
        seoTitle: storeProfile.seoTitle ?? '',
        seoDescription: storeProfile.seoDescription ?? '',
        seoKeywords: storeProfile.seoKeywords ?? '',
      })
    }
  }, [storeProfile, reset])

  useEffect(() => {
    resetForm()
  }, [resetForm])

  const onSubmit = async (values: StoreProfileFormValues) => {
    let logoUrl = values.logo
    let bannerUrl = values.coverImage

    if (values.logo instanceof File) {
      if (storeProfile?.logo) {
        const oldKey = getPathR2FromUrl(storeProfile.logo)
        if (oldKey) {
          await deleteMutation.mutateAsync(oldKey)
        }
      }

      const res = await uploadLogoMutation.mutateAsync(values.logo)
      if (res?.success && res?.url) {
        logoUrl = res.url
      }
    }

    if (values.coverImage instanceof File) {
      if (storeProfile?.coverImage) {
        const oldKey = getPathR2FromUrl(storeProfile.coverImage)
        if (oldKey) {
          await deleteMutation.mutateAsync(oldKey)
        }
      }

      const res = await uploadBannerMutation.mutateAsync(values.coverImage)
      if (res?.success && res?.url) {
        bannerUrl = res.url
      }
    }

    profileMutation.mutate(
      {
        storeId: selectedStoreId as string,
        input: {
          ...values,
          logo: logoUrl,
          coverImage: bannerUrl,
        },
      },
      { onSuccess: () => reset(values) },
    )
  }

  const isPending =
    profileMutation.isPending ||
    uploadLogoMutation.isPending ||
    uploadBannerMutation.isPending ||
    deleteMutation.isPending

  return (
    <Card
      style={{
        '--primary': currentStore?.primaryColor ?? store?.primaryColor,
      } as React.CSSProperties}
    >
      <CardHeader>
        <PageTabHeader
          variant="secondary"
          icon={IconBuildingStore}
          title={t('title')}
          description={t('description')}
        />
      </CardHeader>
      {selectedStoreId === ALL_STORES ? (
        <CardContent>
          <ActionRequiredAlert />
        </CardContent>
      ) : (
        <>
          <CardContent className="space-y-6">
            <div className="grid gap-5 sm:grid-cols-2">
              <Field>
                <FieldLabel>{t('logo')}</FieldLabel>
                <div className="flex flex-wrap items-center gap-5">
                  <div className="border-primary flex h-16.25 shrink-0 items-center justify-center border border-dashed p-1">
                    {logo && <StoreLogo image={previewLogoUrl ?? logo} />}
                    {!logo && <StoreLogo />}
                  </div>
                  <input
                    type="file"
                    ref={logoInputRef}
                    className="hidden"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0]

                      if (file) {
                        setValue('logo', file, { shouldDirty: true })
                      }
                    }}
                  />
                  <div className="space-y-2 pt-1">
                    <Button
                      variant="outline"
                      type="button"
                      className="w-full"
                      onClick={() => logoInputRef.current?.click()}
                    >
                      {t('uploadLogo')}
                    </Button>
                    <FieldDescription className="max-w-xs text-xs leading-normal">
                      {t('logoHint')}
                    </FieldDescription>
                  </div>
                </div>
              </Field>
              <Field>
                <FieldLabel>{t('banner')}</FieldLabel>
                <div className="flex flex-col gap-3">
                  {coverImage && (
                    <div className="border-primary border border-dashed p-1">
                      {isVideo ? (
                        <video
                          src={previewBannerUrl ?? coverImage}
                          className="h-32 w-full object-cover object-center"
                        />
                      ) : (
                        <img
                          src={previewBannerUrl ?? coverImage}
                          className="h-32 w-full object-cover object-center"
                        />
                      )}
                    </div>
                  )}
                  <Button
                    variant="outline"
                    type="button"
                    onClick={() => bannerInputRef.current?.click()}
                  >
                    {t('uploadBanner')}
                  </Button>
                  <input
                    type="file"
                    ref={bannerInputRef}
                    className="hidden"
                    accept="image/*,video/*"
                    onChange={(e) =>
                      setValue('coverImage', e.target.files?.[0], {
                        shouldDirty: true,
                      })
                    }
                  />
                </div>
                <FieldDescription className="max-w-xs text-xs leading-normal">
                  {t('bannerHint')}
                </FieldDescription>
              </Field>
            </div>
            <Separator />
            <Field>
              <FieldLabel>{t('primaryColor')}</FieldLabel>
              <Controller
                control={control}
                name="primaryColor"
                render={({ field }) => (
                  <Select
                    value={field.value ?? ''}
                    onValueChange={field.onChange}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t('primaryColorPlaceholder')} />
                    </SelectTrigger>
                    <SelectContent>
                      {PRIMARY_COLOR_OPTIONS.map((color) => (
                        <SelectItem key={color.value} value={color.value}>
                          <div className="flex items-center gap-2">
                            <div
                              className="h-4 w-4 rounded-full border border-black/10"
                              style={{ backgroundColor: color.value }}
                            />
                            {color.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              <FieldDescription>{t('primaryColorHint')}</FieldDescription>
            </Field>
            <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
              <Field>
                <FieldLabel>{t('name')}</FieldLabel>
                <Input
                  placeholder={t('namePlaceholder')}
                  {...register('name')}
                  disabled={isPending}
                />
                <FieldError>{errors?.name?.message}</FieldError>
              </Field>
              <Field>
                <FieldLabel>{t('slug')}</FieldLabel>
                <div className="flex items-center overflow-hidden rounded-md">
                  <span className="border-input bg-muted text-muted-foreground flex h-9 items-center border border-r-0 px-3 text-sm select-none">
                    sitepow.store/
                  </span>
                  <Input
                    className="rounded-l-none"
                    {...register('slug')}
                    disabled
                  />
                </div>
                <FieldError>{errors?.slug?.message}</FieldError>
              </Field>
              <Field>
                <FieldLabel>{t('email')}</FieldLabel>
                <Input
                  type="email"
                  placeholder="example@store.com"
                  {...register('email')}
                  disabled={isPending}
                />
                <FieldError>{errors?.email?.message}</FieldError>
              </Field>
              <Field>
                <FieldLabel>{t('taxId')}</FieldLabel>
                <Input
                  maxLength={13}
                  placeholder={t('taxIdPlaceholder')}
                  {...register('taxId')}
                  disabled={isPending}
                />
                <FieldError>{errors?.taxId?.message}</FieldError>
              </Field>
              <Field>
                <FieldLabel>{t('storeDesc')}</FieldLabel>
                <Textarea
                  placeholder={t('storeDescPlaceholder')}
                  {...register('description')}
                  disabled={isPending}
                />
                <FieldError>{errors?.description?.message}</FieldError>
              </Field>
            </div>
            <Separator />
            <div className="space-y-5 rounded-xl border p-4 sm:p-5">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <IconSearch size={18} className="text-primary" />
                  <h4 className="text-base font-semibold">
                    {t('seoSettingsTitle')}
                  </h4>
                </div>
                <p className="text-muted-foreground text-xs leading-relaxed">
                  {t('seoSettingsDesc')}
                </p>
              </div>
              <div className="border-input bg-muted/20 flex flex-wrap items-center justify-between gap-5 rounded-xl border border-dashed p-4">
                <div className="space-y-1 pr-4">
                  <span className="block text-sm font-medium">
                    {t('searchEngineIndex')}
                  </span>
                  <span className="text-muted-foreground block text-xs leading-relaxed">
                    {t('searchEngineIndexHint')}
                  </span>
                </div>
                <Controller
                  control={control}
                  name="allowSearchEngineIndex"
                  render={({ field }) => (
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      disabled={isPending}
                    />
                  )}
                />
              </div>
              <div className="grid grid-cols-1 gap-5">
                <Field>
                  <FieldLabel>{t('seoTitle')}</FieldLabel>
                  <Input
                    placeholder={t('seoTitlePlaceholder')}
                    {...register('seoTitle')}
                    disabled={isPending}
                  />
                  <FieldDescription>{t('seoTitleHint')}</FieldDescription>
                </Field>
                <Field>
                  <FieldLabel>{t('seoDescription')}</FieldLabel>
                  <Textarea
                    placeholder={t('seoDescriptionPlaceholder')}
                    {...register('seoDescription')}
                    disabled={isPending}
                  />
                  <FieldDescription>{t('seoDescriptionHint')}</FieldDescription>
                </Field>
                <Field>
                  <FieldLabel>{t('seoKeywords')}</FieldLabel>
                  <Input
                    placeholder={t('seoKeywordsPlaceholder')}
                    {...register('seoKeywords')}
                    disabled={isPending}
                  />
                  <FieldDescription>{t('seoKeywordsHint')}</FieldDescription>
                </Field>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex flex-wrap justify-end gap-2.5 border-t">
            {isDirty && (
              <Button
                type="button"
                variant="outline"
                onClick={resetForm}
                disabled={isPending}
              >
                {t('reset')}
              </Button>
            )}
            <Button
              size="sm"
              disabled={isPending}
              onClick={handleSubmit(onSubmit)}
            >
              {isPending ? (
                <>
                  <Spinner /> {t('saving')}
                </>
              ) : (
                t('save')
              )}
            </Button>
          </CardFooter>
        </>
      )}
    </Card>
  )
}
