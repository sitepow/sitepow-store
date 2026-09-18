'use client'

import { Controller, useFormContext } from 'react-hook-form'
import { useTranslations } from 'next-intl'
import { IconTrash } from '@tabler/icons-react'

import { ActionRequiredAlert } from '@/components/ActionRequiredAlert'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Field, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { ProductType } from '@/generated/prisma/enums'
import { useCurrentStore } from '@/hooks/use-current-store'
import { cn } from '@/lib/utils'
import { ProductFormValues } from '@/zod/product'

import { VariantBasicFields } from './VariantBasicFields'
import { VariantBranchStock } from './VariantBranchStock'
import { VariantDigitalItems } from './VariantDigitalItems'
import { VariantDiscountPoints } from './VariantDiscountPoints'
import { VariantImageUploader } from './VariantImageUploader'
import { VariantShippingDimensions } from './VariantShippingDimensions'

interface VariantItemProps {
  index: number
  removeVariant: (index: number) => void
  isOnlyOne: boolean
}

export function VariantItem({
  index,
  removeVariant,
  isOnlyOne,
}: VariantItemProps) {
  const { currentStore, store } = useCurrentStore()
  const t = useTranslations('merchant.products.form')
  const { control, setValue, watch } = useFormContext<ProductFormValues>()

  const imageValue = watch(`variants.${index}.image`)
  const isAvailable = watch(`variants.${index}.isAvailable`)
  const productType = watch('productType')

  const isPhysical = productType === ProductType.PHYSICAL
  const isDigitalLink = productType === ProductType.DIGITAL_LINK
  const isDigitalItem = productType === ProductType.DIGITAL_ITEM
  const isDigitalService = productType === ProductType.DIGITAL_SERVICE

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setValue(`variants.${index}.image`, file, { shouldDirty: true })
    }
  }

  const handleRemoveImage = () => {
    setValue(`variants.${index}.image`, null, { shouldDirty: true })
  }

  const previewUrl =
    imageValue instanceof File
      ? URL.createObjectURL(imageValue)
      : typeof imageValue === 'string'
        ? imageValue
        : null

  return (
    <Card
      style={
        {
          '--primary': currentStore?.primaryColor ?? store?.primaryColor,
        } as React.CSSProperties
      }
      className={cn(
        'relative overflow-hidden rounded-lg border-l',
        isAvailable && 'border-primary',
      )}
    >
      <div className="flex flex-wrap justify-between gap-2.5 border-b px-5 pt-3 pb-2.5">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">
            {isAvailable ? t('statusActive') : t('statusInactive')}
          </span>
          <Controller
            name={`variants.${index}.isAvailable`}
            control={control}
            render={({ field }) => (
              <Switch checked={field.value} onCheckedChange={field.onChange} />
            )}
          />
        </div>
        <Button
          variant="destructive"
          size="icon-lg"
          onClick={() => removeVariant(index)}
          disabled={isOnlyOne}
        >
          <IconTrash />
        </Button>
      </div>

      <CardContent className="grid gap-6 pt-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-12">
          <VariantImageUploader
            previewUrl={previewUrl}
            onImageChange={handleImageChange}
            onRemoveImage={handleRemoveImage}
          />
          <VariantBasicFields index={index} />
          <VariantDiscountPoints index={index} />

          {isDigitalLink && (
            <div className="sm:col-span-12">
              <Controller
                name={`variants.${index}.digitalUrl`}
                control={control}
                render={({ field }) => (
                  <Field>
                    <FieldLabel className="text-xs">
                      {t('digitalUrl')}
                    </FieldLabel>
                    <Input
                      {...field}
                      value={field.value ?? ''}
                      placeholder={t('digitalUrlPlaceholder')}
                    />
                  </Field>
                )}
              />
            </div>
          )}

          {isPhysical && <VariantShippingDimensions index={index} />}
        </div>

        {isPhysical && <VariantBranchStock index={index} />}
        {isDigitalItem && <VariantDigitalItems index={index} />}
        {isDigitalService && (
          <ActionRequiredAlert
            title={t('webhookAlertTitle')}
            description={t('webhookAlertDesc')}
          />
        )}
      </CardContent>
    </Card>
  )
}
