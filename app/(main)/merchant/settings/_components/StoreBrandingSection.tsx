'use client'

/* eslint-disable jsx-a11y/alt-text */
/* eslint-disable @next/next/no-img-element */
import React from 'react'
import { useTranslations } from 'next-intl'
import { UseFormReturn } from 'react-hook-form'

import { StoreLogo } from '@/components/StoreLogo'
import { Button } from '@/components/ui/button'
import { Field, FieldDescription, FieldLabel } from '@/components/ui/field'
import { StoreProfileFormValues } from '@/zod/store-profile'

interface StoreBrandingSectionProps {
  form: UseFormReturn<StoreProfileFormValues>
  logoInputRef: React.RefObject<HTMLInputElement | null>
  bannerInputRef: React.RefObject<HTMLInputElement | null>
  logo?: string | File
  coverImage?: string | File
  previewLogoUrl?: string
  previewBannerUrl?: string
  isVideo: boolean
}

export function StoreBrandingSection({
  form,
  logoInputRef,
  bannerInputRef,
  logo,
  coverImage,
  previewLogoUrl,
  previewBannerUrl,
  isVideo,
}: StoreBrandingSectionProps) {
  const t = useTranslations('merchant.settings.storeProfile')
  const { setValue } = form

  return (
    <div className="grid gap-5 sm:grid-cols-2">
      <Field>
        <FieldLabel>{t('logo')}</FieldLabel>
        <div className="flex flex-wrap items-center gap-5">
          <div className="border-primary flex h-16.25 shrink-0 items-center justify-center border border-dashed p-1">
            {logo && <StoreLogo image={previewLogoUrl} />}
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
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) {
                setValue('coverImage', file, { shouldDirty: true })
              }
            }}
          />
        </div>
        <FieldDescription className="max-w-xs text-xs leading-normal">
          {t('bannerHint')}
        </FieldDescription>
      </Field>
    </div>
  )
}
