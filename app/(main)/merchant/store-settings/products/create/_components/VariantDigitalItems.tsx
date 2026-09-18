'use client'

import { Controller, useFieldArray, useFormContext } from 'react-hook-form'
import { useTranslations } from 'next-intl'
import { IconTrash } from '@tabler/icons-react'
import { PlusCircle } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { FieldLegend } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { ProductFormValues } from '@/zod/product'

interface VariantDigitalItemsProps {
  index: number
}

export function VariantDigitalItems({ index }: VariantDigitalItemsProps) {
  const t = useTranslations('merchant.products.form')
  const { control } = useFormContext<ProductFormValues>()

  const {
    fields: digitalFields,
    append: appendDigital,
    remove: removeDigital,
  } = useFieldArray({
    control,
    name: `variants.${index}.digitalItems`,
  })

  return (
    <div className="bg-muted/20 mt-6 rounded-lg border p-4">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2.5">
        <FieldLegend variant="label" className="text-lg font-bold">
          {t('digitalItemsTitle')}
        </FieldLegend>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => appendDigital({ content: '', isUsed: false })}
        >
          <PlusCircle className="mr-2 size-4" /> {t('addDigitalItem')}
        </Button>
      </div>
      <div className="space-y-2">
        {digitalFields.map((item, dIndex) => (
          <div key={item.id} className="flex gap-2">
            <Controller
              name={`variants.${index}.digitalItems.${dIndex}.content`}
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  placeholder={t('digitalContentPlaceholder')}
                />
              )}
            />
            <div className="flex flex-col items-center gap-1">
              <span className="text-muted-foreground text-[10px]">
                {t('used')}
              </span>
              <Controller
                name={`variants.${index}.digitalItems.${dIndex}.isUsed`}
                control={control}
                render={({ field }) => (
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    className="scale-90"
                  />
                )}
              />
            </div>
            <Button
              type="button"
              variant="destructive"
              size="icon"
              onClick={() => removeDigital(dIndex)}
            >
              <IconTrash />
            </Button>
          </div>
        ))}
        {digitalFields.length === 0 && (
          <p className="text-muted-foreground py-4 text-center text-sm">
            {t('noDigitalItems')}
          </p>
        )}
      </div>
    </div>
  )
}
