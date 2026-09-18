'use client'

import { useTranslations } from 'next-intl'

import { formatNumber } from '@/utils/pricing'
import { IconWallet } from '@tabler/icons-react'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Slider } from '@/components/ui/slider'

interface PosPointsRedeemSectionProps {
  isPointsEnabled: boolean
  customerId?: string
  usedPoints: number
  maxUsablePoints: number
  pointRedeemRate: number
  pointsDiscount: number
  formatCurrency: (val: number) => string
  onPointsChange: (val: number) => void
}

export function PosPointsRedeemSection({
  isPointsEnabled,
  customerId,
  usedPoints,
  maxUsablePoints,
  pointRedeemRate,
  pointsDiscount,
  formatCurrency,
  onPointsChange,
}: PosPointsRedeemSectionProps) {
  const t = useTranslations('merchant.pos.discountDialog')

  if (!isPointsEnabled) {
    return null
  }

  return (
    <>
      <Separator />
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label className="flex items-center gap-2">
            <IconWallet className="text-muted-foreground size-4" />
            {t('usePoints')}
          </Label>
          <span className="text-primary text-sm font-semibold">
            {formatNumber(usedPoints)} / {formatNumber(maxUsablePoints)}{' '}
            {t('pointsUnit')}
          </span>
        </div>

        <Slider
          max={maxUsablePoints || 1}
          step={1}
          value={[usedPoints]}
          onValueChange={(val) => onPointsChange(val[0])}
          disabled={!customerId || maxUsablePoints === 0}
          className="cursor-pointer"
        />

        <div className="flex items-center gap-2">
          <Input
            type="number"
            value={usedPoints}
            onChange={(e) =>
              onPointsChange(
                Math.max(0, Math.min(Number(e.target.value), maxUsablePoints)),
              )
            }
            disabled={!customerId || maxUsablePoints === 0}
            className="w-24 text-center font-bold"
          />
          <span className="text-muted-foreground text-sm">
            {t('redeemForDiscount')}{' '}
            <strong className="text-primary">
              {formatCurrency(pointsDiscount)}
            </strong>
          </span>
        </div>

        {pointRedeemRate > 0 && (
          <p className="text-muted-foreground text-xs">
            {t('pointsRate', {
              rate: formatCurrency(pointRedeemRate),
            })}
          </p>
        )}
      </div>
    </>
  )
}
