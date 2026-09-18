'use client'

import React from 'react'
import { useTranslations } from 'next-intl'
import { IconTicket } from '@tabler/icons-react'

import { SummaryRow } from '@/app/sites/[domain]/_components/cart/_components/SummaryRow'
import { SummaryTotal } from '@/app/sites/[domain]/_components/cart/_components/SummaryTotal'
import { DialogHeaderIcon } from '@/components/DialogHeaderIcon'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Separator } from '@/components/ui/separator'
import { useCurrentStore } from '@/hooks/use-current-store'
import { useMerchantCurrency } from '@/hooks/use-merchant-currency'

import { usePosDiscount } from '../_hooks/use-pos-discount'
import { PosCouponSection } from './PosCouponSection'
import { PosMemberSection } from './PosMemberSection'
import { PosPointsRedeemSection } from './PosPointsRedeemSection'

interface PosDiscountDialogProps {
  subtotal: number
}

export function PosDiscountDialog({ subtotal }: PosDiscountDialogProps) {
  const { currentStore, store } = useCurrentStore()
  const { formatCurrency } = useMerchantCurrency()
  const t = useTranslations('merchant.pos.discountDialog')

  const {
    open,
    setOpen,
    mode,
    setMode,
    searchInput,
    setSearchInput,
    inputCouponCode,
    setInputCouponCode,
    customerId,
    customerPhone,
    customerPoints,
    usedPoints,
    couponCode,
    couponDiscount,
    createForm,
    isPointsEnabled,
    pointRedeemRate,
    maxUsablePoints,
    pointsDiscount,
    totalDiscount,
    isSearching,
    isCreating,
    isValidatingCoupon,
    handleSearchMember,
    handleCreateMember,
    handleRemoveCustomer,
    handleApplyCouponCode,
    handleRemoveCoupon,
    setValue,
  } = usePosDiscount({ subtotal })

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="relative h-11 w-full justify-between"
        >
          <span className="flex items-center gap-2 font-medium">
            <IconTicket className="text-primary size-4" />
            {t('triggerButton')}
          </span>
          {totalDiscount > 0 ? (
            <span className="text-primary font-bold">
              -{formatCurrency(totalDiscount)}
            </span>
          ) : (
            <span className="text-muted-foreground text-xs font-normal">
              {t('triggerHint')}
            </span>
          )}
        </Button>
      </DialogTrigger>

      <DialogContent
        className="max-h-[90vh] overflow-y-auto sm:max-w-md"
        style={
          {
            '--primary': currentStore?.primaryColor ?? store?.primaryColor,
          } as React.CSSProperties
        }
      >
        <DialogHeader>
          <DialogHeaderIcon
            icon={IconTicket}
            title={t('title')}
            description={t('description')}
          />
        </DialogHeader>

        <div className="space-y-6 pt-2">
          {/* Member Section */}
          <PosMemberSection
            customerId={customerId}
            customerPhone={customerPhone}
            customerPoints={customerPoints}
            mode={mode}
            onModeChange={setMode}
            searchInput={searchInput}
            onSearchInputChange={setSearchInput}
            onSearch={handleSearchMember}
            isSearching={isSearching}
            isCreating={isCreating}
            onRemoveCustomer={handleRemoveCustomer}
            createForm={createForm}
            onCreateSubmit={handleCreateMember}
          />

          {/* Points Redeem Section */}
          <PosPointsRedeemSection
            isPointsEnabled={isPointsEnabled}
            customerId={customerId}
            usedPoints={usedPoints}
            maxUsablePoints={maxUsablePoints}
            pointRedeemRate={pointRedeemRate}
            pointsDiscount={pointsDiscount}
            formatCurrency={formatCurrency}
            onPointsChange={(val) => setValue('usedPoints', val)}
          />

          <Separator />

          {/* Coupon Section */}
          <PosCouponSection
            couponCode={couponCode}
            couponDiscount={couponDiscount}
            inputCouponCode={inputCouponCode}
            onInputCouponCodeChange={setInputCouponCode}
            onApplyCoupon={handleApplyCouponCode}
            onRemoveCoupon={handleRemoveCoupon}
            isValidating={isValidatingCoupon}
            formatCurrency={formatCurrency}
          />

          {/* Discount Summary */}
          {totalDiscount > 0 && (
            <div className="bg-muted/40 space-y-2 rounded-xl border p-3">
              {pointsDiscount > 0 && (
                <SummaryRow
                  label={t('summaryPointsDiscount')}
                  value={`-${formatCurrency(pointsDiscount)}`}
                  isDiscount
                />
              )}
              {couponDiscount > 0 && (
                <SummaryRow
                  label={t('summaryCouponDiscount')}
                  value={`-${formatCurrency(couponDiscount)}`}
                  isDiscount
                />
              )}
              <SummaryTotal
                label={t('summaryTotalDiscount')}
                value={`-${formatCurrency(totalDiscount)}`}
              />
            </div>
          )}

          <Button
            type="button"
            className="w-full"
            onClick={() => setOpen(false)}
          >
            {t('doneButton')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
