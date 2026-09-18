'use client'

import { useTranslations } from 'next-intl'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import {
  PayoutStatus,
  ProfitPayoutItem,
  ShareType,
} from '@/types/profit-sharing'
import {
  IconBuildingBank,
  IconCheck,
  IconClock,
  IconFileCheck,
  IconInfoCircle,
  IconPhoto,
} from '@tabler/icons-react'

interface SettlementMobilePayoutsProps {
  payouts: ProfitPayoutItem[]
  isLoading: boolean
  formatCurrency: (val: number) => string
  onOpenSlip: (payout: ProfitPayoutItem) => void
}

export function SettlementMobilePayouts({
  payouts,
  isLoading,
  formatCurrency,
  onOpenSlip,
}: SettlementMobilePayoutsProps) {
  const t = useTranslations('merchant.profitSharing')

  return (
    <div className="divide-y md:hidden">
      {isLoading ? (
        Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="space-y-3 p-4">
            <div className="flex items-start justify-between">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-5 w-16" />
            </div>
            <Skeleton className="h-10 w-full rounded-lg" />
            <Skeleton className="h-4 w-40" />
          </div>
        ))
      ) : payouts.length === 0 ? (
        <div className="text-muted-foreground flex flex-col items-center justify-center space-y-2 p-8 text-center">
          <IconInfoCircle className="size-8 opacity-40" />
          <p className="text-sm">{t('settlement.emptyPartners')}</p>
        </div>
      ) : (
        payouts.map((payout) => {
          const isPaid = payout.status === PayoutStatus.PAID
          return (
            <div key={payout.partnerId} className="space-y-3 p-4">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="text-foreground font-semibold">
                    {payout.partnerName}
                  </div>
                  <Badge variant="outline" className="mt-1 text-[11px]">
                    {t(`roles.${payout.role}` as 'roles.FOUNDER')}
                  </Badge>
                </div>
                <Badge
                  variant={isPaid ? 'default' : 'secondary'}
                  className={
                    isPaid
                      ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                      : 'border-amber-500/20 bg-amber-500/10 text-amber-600 dark:text-amber-400'
                  }
                >
                  {isPaid ? (
                    <span className="flex items-center gap-1">
                      <IconCheck className="size-3" /> {t('status.PAID')}
                    </span>
                  ) : (
                    <span className="flex items-center gap-1">
                      <IconClock className="size-3" /> {t('status.PENDING')}
                    </span>
                  )}
                </Badge>
              </div>

              <div className="bg-muted/40 flex items-baseline justify-between rounded-lg p-2.5">
                <div className="text-muted-foreground text-xs">
                  {payout.shareType === ShareType.FIXED_MONTHLY ? (
                    <span>
                      {t('settlement.fixedAmountPrefix')}{' '}
                      {formatCurrency(Number(payout.shareValue))}
                    </span>
                  ) : (
                    <span>
                      {t('settlement.shareRatioPrefix')}{' '}
                      {Number(payout.shareValue)}% (
                      {t(`shareTypes.${payout.shareType}` as 'shareTypes.NET_PROFIT_PERCENT')})
                    </span>
                  )}
                </div>
                <div className="text-foreground text-lg font-bold">
                  {formatCurrency(Number(payout.calculatedAmount))}
                </div>
              </div>

              {(payout.bankAccount || payout.promptPay) && (
                <div className="text-muted-foreground space-y-0.5 text-xs">
                  {payout.bankName && (
                    <div className="text-foreground flex items-center gap-1 font-medium">
                      <IconBuildingBank className="text-muted-foreground size-3.5" />
                      {payout.bankName}
                    </div>
                  )}
                  {payout.bankAccount && (
                    <div>
                      {payout.bankAccount}{' '}
                      {payout.bankAccountName
                        ? `(${payout.bankAccountName})`
                        : ''}
                    </div>
                  )}
                  {payout.promptPay && (
                    <div className="text-primary text-[11px]">
                      PromptPay: {payout.promptPay}
                    </div>
                  )}
                </div>
              )}

              <div className="border-border/40 flex items-center justify-end gap-2 border-t pt-2">
                {payout.slipImage && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-primary flex items-center gap-1 text-xs"
                    onClick={() => onOpenSlip(payout)}
                  >
                    <IconPhoto className="size-3.5" />
                    {t('settlement.viewSlip')}
                  </Button>
                )}
                <Button
                  variant={isPaid ? 'outline' : 'default'}
                  size="sm"
                  className="flex-1 text-xs sm:flex-none"
                  onClick={() => onOpenSlip(payout)}
                >
                  <IconFileCheck className="mr-1 size-3.5" />
                  {isPaid
                    ? t('settlement.viewSlipOrEdit')
                    : t('settlement.markPaid')}
                </Button>
              </div>
            </div>
          )
        })
      )}
    </div>
  )
}

