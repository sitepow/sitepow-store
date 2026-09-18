'use client'

import { FieldArrayWithId, useFormContext } from 'react-hook-form'
import { useTranslations } from 'next-intl'
import { IconWand } from '@tabler/icons-react'
import { PlusCircle } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { FieldGroup, FieldLegend } from '@/components/ui/field'
import { Spinner } from '@/components/ui/spinner'
import { DiscountType, ProductType } from '@/generated/prisma/enums'
import { AiGenTask } from '@/types/ai'
import { ProductFormValues } from '@/zod/product'

import { AffiliateLinksSection } from './AffiliateLinksSection'
import { VariantItem } from './VariantItem'

interface ProductVariantsSectionProps {
  variantFields: FieldArrayWithId<ProductFormValues, 'variants', 'id'>[]
  appendVariant: (value: ProductFormValues['variants'][number]) => void
  removeVariant: (index: number) => void
  isGenVariants: boolean
  onAiTrigger: (task: AiGenTask, action: () => void) => void
  onGenVariants: () => void
}

export function ProductVariantsSection({
  variantFields,
  appendVariant,
  removeVariant,
  isGenVariants,
  onAiTrigger,
  onGenVariants,
}: ProductVariantsSectionProps) {
  const t = useTranslations('merchant.products.form')
  const { watch } = useFormContext<ProductFormValues>()
  const productType = watch('productType')

  if (productType === ProductType.AFFILIATE_LINK) {
    return <AffiliateLinksSection />
  }

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-2.5">
        <FieldLegend variant="label" className="text-lg font-bold">
          {t('variantsTitle')}
        </FieldLegend>
        <div className="flex flex-wrap items-center gap-2.5">
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => onAiTrigger(AiGenTask.VARIANTS, onGenVariants)}
            disabled={isGenVariants}
          >
            {isGenVariants ? (
              <Spinner />
            ) : (
              <IconWand className="mr-2 size-4" />
            )}
            {t('aiVariants')}
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={() =>
              appendVariant({
                title: '',
                price: 0,
                sku: '',
                image: null,
                stocks: [{ branchId: '', quantity: 0, minStock: 0 }],
                discount: {
                  active: false,
                  type: DiscountType.PERCENTAGE,
                  amount: 0,
                },
                rewardPoints: { isActive: false, amount: 0 },
                isAvailable: true,
              })
            }
          >
            <PlusCircle className="mr-2 size-4" /> {t('addVariant')}
          </Button>
        </div>
      </div>

      <FieldGroup className="space-y-4">
        {variantFields.map((item, index) => (
          <VariantItem
            key={item.id}
            index={index}
            removeVariant={removeVariant}
            isOnlyOne={variantFields.length === 1}
          />
        ))}
      </FieldGroup>
    </>
  )
}
