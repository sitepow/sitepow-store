'use client'

import { useEffect, useState } from 'react'

import { useTranslations } from 'next-intl'
import { useParams } from 'next/navigation'

import {
  useStorefrontLoyalty,
  useValidateCoupon,
} from '@/actions/hooks/storefront/discount'
import { useSession } from '@/hooks/use-session'
import { useStoreData } from '@/stores/sites/use-store-data'
import { calculateMaxUsablePoints } from '@/utils/cart'
import { formatCurrency, formatNumber } from '@/utils/pricing'
import {
  IconDiscount2,
  IconTicket,
  IconWallet,
  IconX,
} from '@tabler/icons-react'

import { HighlightText } from '@/components/HighlightText'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Slider } from '@/components/ui/slider'

import { SummaryRow } from '../../_components/cart/_components/SummaryRow'
import { SummaryTotal } from '../../_components/cart/_components/SummaryTotal'
import { useCartStore } from '../store'

interface DiscountFormProps {
  subtotal: number
}

export function DiscountForm({ subtotal }: DiscountFormProps) {
  const t = useTranslations('storefront.cart')
  const { store } = useStoreData()

  const params = useParams()
  const storeSlug = params.domain as string

  const { isAuthenticated } = useSession()
  const { data: loyalty } = useStorefrontLoyalty(storeSlug)
  const validateCouponMutation = useValidateCoupon()

  const { appliedCoupon, usedPoints, setAppliedCoupon, setUsedPoints } =
    useCartStore()

  const [couponCode, setCouponCode] = useState('')
  const [couponError, setCouponError] = useState('')

  const pointRedeemRate = loyalty?.pointRedeemRate ?? 0
  const customerPoints = loyalty?.customerPoints ?? 0

  const pointsDiscount = usedPoints * pointRedeemRate
  const couponDiscount = appliedCoupon?.discountAmount ?? 0
  const totalDiscount = pointsDiscount + couponDiscount

  const maxUsablePoints = calculateMaxUsablePoints(
    subtotal,
    couponDiscount,
    pointRedeemRate,
    customerPoints,
  )

  useEffect(() => {
    if (usedPoints > maxUsablePoints) {
      setUsedPoints(maxUsablePoints)
    }
  }, [maxUsablePoints, usedPoints, setUsedPoints])

  const handlePointsChange = (value: number[]) => {
    setUsedPoints(Math.max(0, Math.min(value[0], maxUsablePoints)))
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Math.max(0, Math.min(Number(e.target.value), maxUsablePoints))
    setUsedPoints(val)
  }

  const handleApplyCoupon = () => {
    setCouponError('')
    validateCouponMutation.mutate(
      { storeSlug, code: couponCode.trim(), subtotal },
      {
        onSuccess: (res) => {
          if (res.success && res.data) {
            setAppliedCoupon(res.data)
            setCouponCode('')
          } else {
            setCouponError(res.message ?? t('invalidCoupon'))
          }
        },
      },
    )
  }

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null)
    setCouponError('')
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2" disabled={!isAuthenticated}>
          <IconTicket />
          {t('addDiscount')}
        </Button>
      </DialogTrigger>
      <DialogContent
        className="sm:max-w-md"
        style={{ '--primary': store?.primaryColor } as React.CSSProperties}
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <IconTicket className="text-primary" />
            {t('applyDiscount')}
          </DialogTitle>
        </DialogHeader>
        <div className="grid gap-6 py-4">
          {loyalty?.isPointsEnabled && (
            <>
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
                  max={maxUsablePoints}
                  step={10}
                  value={[usedPoints]}
                  onValueChange={handlePointsChange}
                  disabled={maxUsablePoints === 0}
                  className="cursor-pointer"
                />
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    value={usedPoints}
                    onChange={handleInputChange}
                    disabled={maxUsablePoints === 0}
                    className="w-24 text-center font-bold"
                  />
                  <span className="text-muted-foreground text-sm">
                    {t.rich('redeemWorth', {
                      amount: formatCurrency(pointsDiscount),
                      strong: (chunks) => (
                        <strong className="text-primary">{chunks}</strong>
                      ),
                    })}
                  </span>
                </div>
                <p className="text-muted-foreground text-xs">
                  {t('pointsRateInfo', {
                    points: formatNumber(customerPoints),
                    rate: formatCurrency(pointRedeemRate),
                  })}
                </p>
              </div>
              <Separator />
            </>
          )}
          <div className="space-y-3">
            <Label className="flex items-center gap-2">
              <IconDiscount2 className="text-muted-foreground size-4" />
              {t('couponCode')}
            </Label>
            {appliedCoupon ? (
              <div className="border-primary/20 bg-primary/5 flex items-center justify-between rounded-md border px-3 py-2">
                <span className="text-sm font-medium">
                  {appliedCoupon.code}
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-primary text-sm font-semibold">
                    -{formatCurrency(appliedCoupon.discountAmount)}
                  </span>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handleRemoveCoupon}
                  >
                    <IconX />
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex gap-2">
                <Input
                  placeholder={t('enterCouponCodePlaceholder')}
                  value={couponCode}
                  className="uppercase"
                  onChange={(e) => setCouponCode(e.target.value)}
                />
                <Button
                  variant="outline"
                  onClick={handleApplyCoupon}
                  disabled={
                    !couponCode.trim() || validateCouponMutation.isPending
                  }
                >
                  {validateCouponMutation.isPending
                    ? t('checking')
                    : t('applyCode')}
                </Button>
              </div>
            )}
            {couponError && (
              <p className="text-destructive text-xs">{couponError}</p>
            )}
          </div>
          <div className="bg-muted/20 space-y-3 rounded-xl border p-4">
            <SummaryRow
              label={t('pointsDiscountLabel')}
              value={
                <HighlightText>
                  - {formatCurrency(pointsDiscount)}
                </HighlightText>
              }
            />
            <SummaryRow
              label={t('couponDiscount')}
              value={
                <HighlightText>
                  - {formatCurrency(couponDiscount)}
                </HighlightText>
              }
            />
            <Separator />
            <SummaryTotal
              label={t('totalDiscount')}
              value={formatCurrency(totalDiscount)}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
