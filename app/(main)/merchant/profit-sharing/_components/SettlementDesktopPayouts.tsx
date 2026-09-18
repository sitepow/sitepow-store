'use client'

import { useTranslations } from 'next-intl'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
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

interface SettlementDesktopPayoutsProps {
  payouts: ProfitPayoutItem[]
  isLoading: boolean
  formatCurrency: (val: number) => string
  onOpenSlip: (payout: ProfitPayoutItem) => void
}

export function SettlementDesktopPayouts({
  payouts,
  isLoading,
  formatCurrency,
  onOpenSlip,
}: SettlementDesktopPayoutsProps) {
  const t = useTranslations('merchant.profitSharing')

  return (
    <div className="hidden md:block">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t('settlement.thColPartner')}</TableHead>
            <TableHead>{t('settlement.thColCondition')}</TableHead>
            <TableHead className="text-right">
              {t('settlement.calculatedPayout')}
            </TableHead>
            <TableHead>{t('settlement.thColPaymentChannel')}</TableHead>
            <TableHead className="text-center">
              {t('settlement.thColStatus')}
            </TableHead>
            <TableHead className="text-right">
              {t('settlement.thColActions')}
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <TableRow key={i}>
                <TableCell>
                  <Skeleton className="h-5 w-32" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-5 w-24" />
                </TableCell>
                <TableCell className="text-right">
                  <Skeleton className="ml-auto h-5 w-16" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-5 w-36" />
                </TableCell>
                <TableCell className="text-center">
                  <Skeleton className="mx-auto h-5 w-16" />
                </TableCell>
                <TableCell className="text-right">
                  <Skeleton className="ml-auto h-5 w-20" />
                </TableCell>
              </TableRow>
            ))
          ) : payouts.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={6}
                className="text-muted-foreground h-32 text-center"
              >
                <div className="flex flex-col items-center justify-center space-y-2">
                  <IconInfoCircle className="size-8 opacity-40" />
                  <p>{t('settlement.emptyPartners')}</p>
                </div>
              </TableCell>
            </TableRow>
          ) : (
            payouts.map((payout) => {
              const isPaid = payout.status === PayoutStatus.PAID
              return (
                <TableRow key={payout.partnerId}>
                  <TableCell>
                    <div className="text-foreground font-semibold">
                      {payout.partnerName}
                    </div>
                    <Badge variant="outline" className="mt-0.5 text-[11px]">
                      {t(`roles.${payout.role}` as 'roles.FOUNDER')}
                    </Badge>
                  </TableCell>

                  <TableCell>
                    <div className="text-sm font-medium">
                      {payout.shareType === ShareType.FIXED_MONTHLY ? (
                        <span>
                          {t('settlement.fixedAmountPrefix')}{' '}
                          {formatCurrency(Number(payout.shareValue))}
                        </span>
                      ) : (
                        <span>{Number(payout.shareValue)}%</span>
                      )}
                    </div>
                    <div className="text-muted-foreground text-xs">
                      {t(`shareTypes.${payout.shareType}` as 'shareTypes.NET_PROFIT_PERCENT')}
                    </div>
                  </TableCell>

                  <TableCell className="text-foreground text-right text-base font-bold">
                    {formatCurrency(Number(payout.calculatedAmount))}
                  </TableCell>

                  <TableCell>
                    {payout.bankAccount || payout.promptPay ? (
                      <div className="space-y-0.5 text-xs">
                        {payout.bankName && (
                          <div className="text-foreground flex items-center gap-1 font-medium">
                            <IconBuildingBank className="text-muted-foreground size-3" />
                            {payout.bankName}
                          </div>
                        )}
                        {payout.bankAccount && (
                          <div className="text-muted-foreground">
                            {payout.bankAccount}
                          </div>
                        )}
                        {payout.promptPay && (
                          <div className="text-primary text-[11px]">
                            PromptPay: {payout.promptPay}
                          </div>
                        )}
                      </div>
                    ) : (
                      <span className="text-muted-foreground text-xs italic">
                        -
                      </span>
                    )}
                  </TableCell>

                  <TableCell className="text-center">
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
                          <IconClock className="size-3" />{' '}
                          {t('status.PENDING')}
                        </span>
                      )}
                    </Badge>
                  </TableCell>

                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {payout.slipImage && (
                        <Button
                          variant="ghost"
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
                        className="text-xs"
                        onClick={() => onOpenSlip(payout)}
                      >
                        <IconFileCheck className="mr-1 size-3.5" />
                        {isPaid
                          ? t('settlement.viewSlipOrEdit')
                          : t('settlement.markPaid')}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              )
            })
          )}
        </TableBody>
      </Table>
    </div>
  )
}

