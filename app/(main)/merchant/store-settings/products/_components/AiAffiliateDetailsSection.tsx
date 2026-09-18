'use client'

import { useTranslations } from 'next-intl'
import { IconPlus, IconTrash } from '@tabler/icons-react'

import { Button } from '@/components/ui/button'
import { Field, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'

interface CategoryOption {
  id: string
  title: string
}

interface AiAffiliateDetailsSectionProps {
  title: string
  slug: string
  selectedCategoryId: string
  destinationUrl: string
  tags: string
  description: string
  specs: { key: string; value: string }[]
  categories: CategoryOption[]
  onTitleChange: (val: string) => void
  onSlugChange: (val: string) => void
  onCategoryChange: (val: string) => void
  onDestinationUrlChange: (val: string) => void
  onTagsChange: (val: string) => void
  onDescriptionChange: (val: string) => void
  onAddSpec: () => void
  onRemoveSpec: (idx: number) => void
  onUpdateSpec: (idx: number, field: 'key' | 'value', val: string) => void
}

export function AiAffiliateDetailsSection({
  title,
  slug,
  selectedCategoryId,
  destinationUrl,
  tags,
  description,
  specs,
  categories,
  onTitleChange,
  onSlugChange,
  onCategoryChange,
  onDestinationUrlChange,
  onTagsChange,
  onDescriptionChange,
  onAddSpec,
  onRemoveSpec,
  onUpdateSpec,
}: AiAffiliateDetailsSectionProps) {
  const t = useTranslations('merchant.products.aiAffiliateDialog')

  return (
    <div className="space-y-4">
      <Field>
        <FieldLabel>{t('fieldTitle')} *</FieldLabel>
        <Input
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
        />
      </Field>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field>
          <FieldLabel>{t('fieldSlug')}</FieldLabel>
          <Input
            value={slug}
            onChange={(e) => onSlugChange(e.target.value)}
          />
        </Field>

        <Field>
          <FieldLabel>{t('categoryLabel')} *</FieldLabel>
          <Select
            value={selectedCategoryId}
            onValueChange={onCategoryChange}
          >
            <SelectTrigger>
              <SelectValue placeholder={t('categoryPlaceholder')} />
            </SelectTrigger>
            <SelectContent>
              {categories.map((cat) => (
                <SelectItem key={cat.id} value={cat.id}>
                  {cat.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
      </div>

      <Field>
        <FieldLabel className="text-xs sm:text-sm">
          {t('affiliateUrlLabel')}
        </FieldLabel>
        <Input
          type="url"
          value={destinationUrl}
          onChange={(e) => onDestinationUrlChange(e.target.value)}
          className="text-xs sm:text-sm"
        />
      </Field>

      <Field>
        <FieldLabel className="text-xs sm:text-sm">
          {t('fieldTags')}
        </FieldLabel>
        <Input
          value={tags}
          onChange={(e) => onTagsChange(e.target.value)}
          placeholder="เก้าอี้เพื่อสุขภาพ, ergonomic, WFH"
          className="text-xs sm:text-sm"
        />
      </Field>

      <Field>
        <FieldLabel className="text-xs sm:text-sm">
          {t('fieldDescription')}
        </FieldLabel>
        <Textarea
          rows={6}
          value={description}
          onChange={(e) => onDescriptionChange(e.target.value)}
          className="text-xs leading-relaxed"
        />
      </Field>

      {/* Specifications / Metadata */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <FieldLabel className="text-xs sm:text-sm">
            {t('fieldSpecs')}
          </FieldLabel>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onAddSpec}
            className="h-7 px-2 text-xs sm:px-3"
          >
            <IconPlus className="mr-1 h-3.5 w-3.5" />
            {t('addSpec')}
          </Button>
        </div>

        <div className="space-y-2">
          {specs.map((item, idx) => (
            <div key={idx} className="flex items-center gap-1.5 sm:gap-2">
              <Input
                placeholder={t('specKey')}
                value={item.key}
                onChange={(e) => onUpdateSpec(idx, 'key', e.target.value)}
                className="w-2/5 text-xs sm:w-1/3"
              />
              <Input
                placeholder={t('specValue')}
                value={item.value}
                onChange={(e) => onUpdateSpec(idx, 'value', e.target.value)}
                className="flex-1 text-xs"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => onRemoveSpec(idx)}
                className="text-destructive h-8 w-8 shrink-0"
              >
                <IconTrash className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
