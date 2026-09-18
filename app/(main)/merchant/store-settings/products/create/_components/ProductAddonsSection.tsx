'use client'

import { FieldArrayWithId, useFormContext } from 'react-hook-form'
import { useTranslations } from 'next-intl'
import { IconTrash, IconWand } from '@tabler/icons-react'
import { PlusCircle } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Spinner } from '@/components/ui/spinner'
import { AiGenTask } from '@/types/ai'
import { ProductFormValues } from '@/zod/product'

interface ProductAddonsSectionProps {
  addonFields: FieldArrayWithId<ProductFormValues, 'addons', 'id'>[]
  appendAddon: (value: { title: string; price: number; isAvailable: boolean }) => void
  removeAddon: (index: number) => void
  isPending: boolean
  isGenAddons: boolean
  onAiTrigger: (task: AiGenTask, action: () => void) => void
  onGenAddons: () => void
}

export function ProductAddonsSection({
  addonFields,
  appendAddon,
  removeAddon,
  isPending,
  isGenAddons,
  onAiTrigger,
  onGenAddons,
}: ProductAddonsSectionProps) {
  const t = useTranslations('merchant.products.form')
  const { register } = useFormContext<ProductFormValues>()

  return (
    <FieldSet
      disabled={isPending}
      className="dark:bg-foreground/5 border-l-primary rounded-lg border p-6"
    >
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2.5">
        <FieldLegend variant="label" className="text-lg font-bold">
          {t('addonsTitle')}
        </FieldLegend>
        <div className="flex flex-wrap gap-2.5">
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => onAiTrigger(AiGenTask.ADDONS, onGenAddons)}
            disabled={isGenAddons}
          >
            {isGenAddons ? (
              <Spinner />
            ) : (
              <IconWand className="mr-2 size-4" />
            )}
            {t('aiAddons')}
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={() =>
              appendAddon({ title: '', price: 0, isAvailable: true })
            }
          >
            <PlusCircle className="mr-2 size-4" /> {t('addAddon')}
          </Button>
        </div>
      </div>

      <FieldGroup className="grid gap-4">
        {addonFields.map((item, index) => (
          <Card key={item.id}>
            <CardContent className="flex items-end gap-3 pt-6">
              <div className="grid flex-1 gap-3">
                <Field>
                  <FieldLabel className="text-xs">
                    {t('addonNamePlaceholder')}
                  </FieldLabel>
                  <Input {...register(`addons.${index}.title`)} />
                </Field>
                <Field>
                  <FieldLabel className="text-xs">
                    {t('extraPrice')}
                  </FieldLabel>
                  <Input
                    type="number"
                    {...register(`addons.${index}.price`, {
                      valueAsNumber: true,
                    })}
                  />
                </Field>
              </div>
              <Button
                type="button"
                variant="destructive"
                size="icon-lg"
                onClick={() => removeAddon(index)}
              >
                <IconTrash />
              </Button>
            </CardContent>
          </Card>
        ))}
        {addonFields.length === 0 && (
          <div className="text-muted-foreground rounded-lg border-2 border-dashed py-6 text-center md:col-span-2">
            {t('noAddons')}
          </div>
        )}
      </FieldGroup>
    </FieldSet>
  )
}
