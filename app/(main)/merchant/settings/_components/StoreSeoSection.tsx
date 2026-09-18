'use client'

import React from 'react'
import { useTranslations } from 'next-intl'
import { Controller, UseFormReturn } from 'react-hook-form'
import { IconSearch, IconSparkles } from '@tabler/icons-react'

import { Button } from '@/components/ui/button'
import { Field, FieldDescription, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Spinner } from '@/components/ui/spinner'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { StoreProfileFormValues } from '@/zod/store-profile'

interface StoreSeoSectionProps {
  form: UseFormReturn<StoreProfileFormValues>
  isPending: boolean
  isGeneratingSeo: boolean
  onGenerateSeo: () => void
}

export function StoreSeoSection({
  form,
  isPending,
  isGeneratingSeo,
  onGenerateSeo,
}: StoreSeoSectionProps) {
  const t = useTranslations('merchant.settings.storeProfile')
  const { register, control } = form

  return (
    <div className="space-y-5 rounded-xl border p-4 sm:p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
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

        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={isPending}
          onClick={onGenerateSeo}
          className="border-primary/40 hover:border-primary hover:bg-primary/5 text-primary shrink-0 gap-1.5"
        >
          {isGeneratingSeo ? (
            <>
              <Spinner />
              <span>กำลังคิด SEO...</span>
            </>
          ) : (
            <>
              <IconSparkles size={16} />
              <span>ให้ AI ช่วยคิด SEO</span>
            </>
          )}
        </Button>
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
  )
}

