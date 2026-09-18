'use client'

import { useTranslations } from 'next-intl'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { IconDiscount2, IconX } from '@tabler/icons-react'

interface PosCouponSectionProps {
  couponCode?: string
  couponDiscount: number
  inputCouponCode: string
  onInputCouponCodeChange: (code: string) => void
  onApplyCoupon: () => void
  onRemoveCoupon: () => void
  isValidating: boolean
  formatCurrency: (val: number) => string
}

export function PosCouponSection({
  couponCode,
  couponDiscount,
  inputCouponCode,
  onInputCouponCodeChange,
  onApplyCoupon,
  onRemoveCoupon,
  isValidating,
  formatCurrency,
}: PosCouponSectionProps) {
  const t = useTranslations('merchant.pos.discountDialog')

  return (
    <div className="space-y-3">
      <Label className="flex items-center gap-2">
        <IconDiscount2 className="text-muted-foreground size-4" />
        {t('couponTitle')}
      </Label>

      {couponCode ? (
        <div className="border-primary/20 bg-primary/5 flex items-center justify-between rounded-md border px-3 py-2">
          <span className="text-sm font-medium">{couponCode}</span>
          <div className="flex items-center gap-2">
            <span className="text-primary text-sm font-semibold">
              -{formatCurrency(couponDiscount)}
            </span>
            <Button
              variant="outline"
              size="icon"
              onClick={onRemoveCoupon}
            >
              <IconX />
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex gap-2">
          <Input
            placeholder={t('couponPlaceholder')}
            value={inputCouponCode}
            className="uppercase"
            onChange={(e) => onInputCouponCodeChange(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && onApplyCoupon()}
          />
          <Button
            variant="outline"
            onClick={onApplyCoupon}
            disabled={!inputCouponCode.trim() || isValidating}
          >
            {isValidating ? t('validatingCoupon') : t('applyCoupon')}
          </Button>
        </div>
      )}
    </div>
  )
}

