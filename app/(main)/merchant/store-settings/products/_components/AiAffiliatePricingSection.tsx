'use client'

import { useTranslations } from 'next-intl'

import { Field, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { AffiliatePlatform } from '@/types/affiliate-product'

interface AiAffiliatePricingSectionProps {
  price: number
  originalPrice: number
  platform: AffiliatePlatform
  platformLabel: string
  isOnSale: boolean
  discountText: string
  onPriceChange: (val: number) => void
  onOriginalPriceChange: (val: number) => void
  onPlatformChange: (val: AffiliatePlatform) => void
  onPlatformLabelChange: (val: string) => void
  onIsOnSaleChange: (val: boolean) => void
  onDiscountTextChange: (val: string) => void
}

const PLATFORM_OPTIONS: { value: AffiliatePlatform; label: string }[] = [
  { value: 'SHOPEE', label: 'Shopee' },
  { value: 'LAZADA', label: 'Lazada' },
  { value: 'TIKTOK', label: 'TikTok Shop' },
  { value: 'OTHER', label: 'Other / ร้านค้าทั่วไป' },
]

export function AiAffiliatePricingSection({
  price,
  originalPrice,
  platform,
  platformLabel,
  isOnSale,
  discountText,
  onPriceChange,
  onOriginalPriceChange,
  onPlatformChange,
  onPlatformLabelChange,
  onIsOnSaleChange,
  onDiscountTextChange,
}: AiAffiliatePricingSectionProps) {
  const t = useTranslations('merchant.products.aiAffiliateDialog')

  return (
    <>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
        <Field>
          <FieldLabel className="text-xs sm:text-sm">
            {t('fieldPrice')} *
          </FieldLabel>
          <Input
            type="number"
            min={0}
            value={price}
            onChange={(e) => onPriceChange(parseFloat(e.target.value) || 0)}
            className="text-xs sm:text-sm"
          />
        </Field>

        <Field>
          <FieldLabel className="text-xs sm:text-sm">
            {t('fieldOriginalPrice')}
          </FieldLabel>
          <Input
            type="number"
            min={0}
            value={originalPrice}
            onChange={(e) =>
              onOriginalPriceChange(parseFloat(e.target.value) || 0)
            }
            className="text-xs sm:text-sm"
          />
        </Field>

        <Field>
          <FieldLabel className="text-xs sm:text-sm">
            {t('fieldPlatform')}
          </FieldLabel>
          <Select
            value={platform}
            onValueChange={(val) => onPlatformChange(val as AffiliatePlatform)}
          >
            <SelectTrigger className="text-xs sm:text-sm">
              <SelectValue />
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

        <Field>
          <FieldLabel className="text-xs sm:text-sm">
            {t('fieldPlatformLabel')}
          </FieldLabel>
          <Input
            placeholder="Shopee Mall, LazMall"
            value={platformLabel}
            onChange={(e) => onPlatformLabelChange(e.target.value)}
            className="text-xs sm:text-sm"
          />
        </Field>
      </div>

      <div className="flex flex-col items-start gap-3 rounded-lg border p-3 sm:flex-row sm:items-center sm:gap-6">
        <div className="flex items-center gap-2.5">
          <Switch
            checked={isOnSale}
            onCheckedChange={onIsOnSaleChange}
            id="isOnSaleSwitch"
          />
          <label
            htmlFor="isOnSaleSwitch"
            className="cursor-pointer text-xs font-medium sm:text-sm"
          >
            {t('fieldIsOnSale')}
          </label>
        </div>

        {isOnSale && (
          <div className="w-full sm:flex-1">
            <Input
              placeholder={t('fieldDiscountText')}
              value={discountText}
              onChange={(e) => onDiscountTextChange(e.target.value)}
              className="h-8 text-xs"
            />
          </div>
        )}
      </div>
    </>
  )
}
