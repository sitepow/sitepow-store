'use client'

import { Controller, FieldArrayWithId, useFormContext } from 'react-hook-form'
import { useTranslations } from 'next-intl'
import { IconTrash, IconWand } from '@tabler/icons-react'
import { CirclePlus } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Field, FieldLabel, FieldLegend, FieldSet } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Spinner } from '@/components/ui/spinner'
import { AiGenTask } from '@/types/ai'
import { ProductFormValues } from '@/zod/product'

import { MetadataCombobox } from './MetadataCombobox'

interface ProductMetadataTagsSectionProps {
  metadataFields: FieldArrayWithId<ProductFormValues, 'metadata', 'id'>[]
  appendMetadata: (value: { key: string; value: string }) => void
  removeMetadata: (index: number) => void
  isPending: boolean
  isGenMeta: boolean
  isGenTags: boolean
  onAiTrigger: (task: AiGenTask, action: () => void) => void
  onGenMeta: () => void
  onGenTags: () => void
}

export function ProductMetadataTagsSection({
  metadataFields,
  appendMetadata,
  removeMetadata,
  isPending,
  isGenMeta,
  isGenTags,
  onAiTrigger,
  onGenMeta,
  onGenTags,
}: ProductMetadataTagsSectionProps) {
  const t = useTranslations('merchant.products.form')
  const { control, register } = useFormContext<ProductFormValues>()

  return (
    <FieldSet
      disabled={isPending}
      className="dark:bg-foreground/5 border-l-primary rounded-lg border p-4"
    >
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2.5">
        <FieldLegend variant="label" className="text-lg font-bold">
          {t('metadataTitle')}
        </FieldLegend>
        <div className="flex flex-wrap gap-2.5">
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => onAiTrigger(AiGenTask.METADATA, onGenMeta)}
            disabled={isGenMeta}
          >
            {isGenMeta ? <Spinner /> : <IconWand className="mr-2 size-4" />}
            {t('aiMetadata')}
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={() => appendMetadata({ key: '', value: '' })}
          >
            <CirclePlus className="mr-1 size-4" /> {t('addField')}
          </Button>
        </div>
      </div>

      <div className="space-y-3">
        {metadataFields.map((field, index) => (
          <div key={field.id} className="flex flex-wrap items-start gap-2">
            <div className="w-1/3">
              <Controller
                control={control}
                name={`metadata.${index}.key`}
                render={({ field: selectField }) => (
                  <MetadataCombobox
                    value={selectField.value ?? ''}
                    onChange={selectField.onChange}
                  />
                )}
              />
            </div>
            <Input
              placeholder={t('propertyValuePlaceholder')}
              className="flex-1"
              {...register(`metadata.${index}.value`)}
            />
            <Button
              type="button"
              variant="destructive"
              size="icon-lg"
              onClick={() => removeMetadata(index)}
            >
              <IconTrash />
            </Button>
          </div>
        ))}
      </div>

      <Field className="mt-4">
        <FieldLabel>{t('tagsLabel')}</FieldLabel>
        <div className="flex gap-2">
          <Input
            placeholder={t('tagsPlaceholder')}
            {...register('tags')}
            disabled={isPending}
          />
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => onAiTrigger(AiGenTask.TAGS, onGenTags)}
            disabled={isGenTags}
          >
            {isGenTags ? <Spinner /> : <IconWand />}
          </Button>
        </div>
      </Field>
    </FieldSet>
  )
}
