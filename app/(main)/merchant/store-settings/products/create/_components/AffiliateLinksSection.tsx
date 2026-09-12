'use client'

import { Controller, useFieldArray, useFormContext } from 'react-hook-form'

import { useTranslations } from 'next-intl'

import {
  AFFILIATE_PLATFORM_CONFIG,
  AffiliatePlatform,
} from '@/types/affiliate-product'
import { ProductFormValues } from '@/zod/product'
import { IconTrash } from '@tabler/icons-react'
import { ExternalLink, PlusCircle } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'

const PLATFORM_OPTIONS: { value: AffiliatePlatform; label: string }[] = [
  { value: 'SHOPEE', label: 'Shopee' },
  { value: 'LAZADA', label: 'Lazada' },
  { value: 'TIKTOK', label: 'TikTok Shop' },
  { value: 'OTHER', label: 'Other / ร้านค้าภายนอก' },
]

export function AffiliateLinksSection() {
  const t = useTranslations('merchant.products.form.affiliateLinks')
  const {
    control,
    formState: { errors },
  } = useFormContext<ProductFormValues>()

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'affiliateLinks',
  })

  const handleAddLink = () => {
    append({
      id: `aff-${Date.now()}`,
      platform: 'SHOPEE',
      url: '',
      label: '',
      price: 0,
      originalPrice: 0,
      isDiscounted: false,
      discountText: '',
    })
  }

  return (
    <FieldSet className="border-l-primary bg-muted/10 space-y-4 rounded-lg border p-4">
      <div className="flex flex-wrap items-center justify-between gap-2.5">
        <div>
          <FieldLegend variant="label" className="text-lg font-bold">
            {t('title')}
          </FieldLegend>
          <p className="text-muted-foreground mt-0.5 text-xs">
            {t('description')}
          </p>
        </div>
        <Button
          type="button"
          size="sm"
          onClick={handleAddLink}
          className="font-medium"
        >
          <PlusCircle className="mr-2 size-4" />
          {t('addLink')}
        </Button>
      </div>

      {fields.length === 0 ? (
        <Card className="bg-muted/20 border-dashed">
          <CardContent className="flex flex-col items-center justify-center space-y-3 p-8 text-center">
            <div className="bg-primary/10 text-primary rounded-full p-3">
              <ExternalLink className="size-6" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-semibold">{t('noLinksAlert')}</p>
              <p className="text-muted-foreground text-xs">
                {t('description')}
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleAddLink}
            >
              <PlusCircle className="mr-2 size-4" />
              {t('addLink')}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <FieldGroup className="space-y-4">
          {fields.map((fieldItem, index) => {
            return (
              <Controller
                key={fieldItem.id}
                control={control}
                name={`affiliateLinks.${index}`}
                render={({ field: linkField }) => {
                  const currentPlatform =
                    (linkField.value?.platform as AffiliatePlatform) || 'OTHER'
                  const config =
                    AFFILIATE_PLATFORM_CONFIG[currentPlatform] ||
                    AFFILIATE_PLATFORM_CONFIG.OTHER
                  const isDiscounted = linkField.value?.isDiscounted ?? false

                  return (
                    <Card
                      className={`relative border transition-all ${config.borderClass} shadow-sm`}
                    >
                      <CardContent className="space-y-4 p-4">
                        <div className="flex flex-wrap items-center justify-between gap-2 border-b pb-2">
                          <div className="flex items-center gap-2">
                            <span className="text-muted-foreground text-xs font-semibold">
                              {t('linkNumber', { index: index + 1 })}
                            </span>
                            <Badge className={config.badgeClass}>
                              {config.name}
                            </Badge>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => remove(index)}
                            className="text-destructive hover:text-destructive hover:bg-destructive/10 h-8"
                            title={t('removeLink')}
                          >
                            <IconTrash className="mr-1 size-4" />
                            <span className="text-xs">{t('removeLink')}</span>
                          </Button>
                        </div>

                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                          {/* Platform Selector */}
                          <Field>
                            <FieldLabel>{t('platform')}</FieldLabel>
                            <Select
                              value={currentPlatform}
                              onValueChange={(val: AffiliatePlatform) =>
                                linkField.onChange({
                                  ...linkField.value,
                                  platform: val,
                                })
                              }
                            >
                              <SelectTrigger>
                                <SelectValue
                                  placeholder={t('selectPlatform')}
                                />
                              </SelectTrigger>
                              <SelectContent>
                                {PLATFORM_OPTIONS.map((opt) => (
                                  <SelectItem key={opt.value} value={opt.value}>
                                    {opt.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </Field>

                          {/* Label / Store name */}
                          <Field>
                            <FieldLabel>{t('label')}</FieldLabel>
                            <Input
                              value={linkField.value?.label || ''}
                              onChange={(e) =>
                                linkField.onChange({
                                  ...linkField.value,
                                  label: e.target.value,
                                })
                              }
                              placeholder={t('labelPlaceholder')}
                            />
                          </Field>
                        </div>

                        {/* URL */}
                        <Field>
                          <FieldLabel className="required">
                            {t('url')}
                          </FieldLabel>
                          <div className="relative">
                            <Input
                              value={linkField.value?.url || ''}
                              onChange={(e) =>
                                linkField.onChange({
                                  ...linkField.value,
                                  url: e.target.value,
                                })
                              }
                              placeholder={t('urlPlaceholder')}
                              className="pr-9"
                            />
                            {linkField.value?.url && (
                              <a
                                href={linkField.value.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-muted-foreground hover:text-foreground absolute top-1/2 right-2.5 -translate-y-1/2"
                                title="Open Link"
                              >
                                <ExternalLink className="size-4" />
                              </a>
                            )}
                          </div>
                          {errors.affiliateLinks?.[index]?.url && (
                            <FieldError>
                              {errors.affiliateLinks[index]?.url?.message}
                            </FieldError>
                          )}
                        </Field>

                        {/* Price & Original Price */}
                        <div className="grid grid-cols-1 items-end gap-4 sm:grid-cols-2 md:grid-cols-3">
                          <Field>
                            <FieldLabel>{t('price')}</FieldLabel>
                            <Input
                              type="number"
                              min="0"
                              step="0.01"
                              value={linkField.value?.price ?? 0}
                              onChange={(e) =>
                                linkField.onChange({
                                  ...linkField.value,
                                  price: Number(e.target.value),
                                })
                              }
                              placeholder={t('pricePlaceholder')}
                            />
                          </Field>

                          <Field>
                            <FieldLabel>{t('originalPrice')}</FieldLabel>
                            <Input
                              type="number"
                              min="0"
                              step="0.01"
                              value={linkField.value?.originalPrice ?? ''}
                              onChange={(e) =>
                                linkField.onChange({
                                  ...linkField.value,
                                  originalPrice: e.target.value
                                    ? Number(e.target.value)
                                    : undefined,
                                })
                              }
                              placeholder={t('originalPricePlaceholder')}
                            />
                          </Field>

                          <div className="flex h-10 items-center gap-2 pb-1">
                            <Switch
                              checked={isDiscounted}
                              onCheckedChange={(checked) =>
                                linkField.onChange({
                                  ...linkField.value,
                                  isDiscounted: checked,
                                })
                              }
                              id={`discount-switch-${index}`}
                            />
                            <label
                              htmlFor={`discount-switch-${index}`}
                              className="cursor-pointer text-xs font-medium"
                            >
                              {t('isOnSale')}
                            </label>
                          </div>
                        </div>

                        {/* Discount Text / Promotion Tag */}
                        {isDiscounted && (
                          <Field className="animate-in fade-in-50 duration-150">
                            <FieldLabel>{t('discountText')}</FieldLabel>
                            <Input
                              value={linkField.value?.discountText || ''}
                              onChange={(e) =>
                                linkField.onChange({
                                  ...linkField.value,
                                  discountText: e.target.value,
                                })
                              }
                              placeholder={t('discountTextPlaceholder')}
                            />
                          </Field>
                        )}
                      </CardContent>
                    </Card>
                  )
                }}
              />
            )
          })}
        </FieldGroup>
      )}
    </FieldSet>
  )
}
