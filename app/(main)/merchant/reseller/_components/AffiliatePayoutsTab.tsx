'use client'

import { useLocale, useTranslations } from 'next-intl'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { TabsContent } from '@/components/ui/tabs'
import { AffiliatePayoutItem } from '@/types/affiliate'
import { formatCurrency } from '@/utils/pricing'
import { IconExternalLink } from '@tabler/icons-react'

interface AffiliatePayoutsTabProps {
  payouts: AffiliatePayoutItem[]
  isLoading: boolean
  onManagePayout: (payout: AffiliatePayoutItem) => void
}

export function AffiliatePayoutsTab({
  payouts,
  isLoading,
  onManagePayout,
}: AffiliatePayoutsTabProps) {
  const t = useTranslations('merchant.reseller.affiliate')
  const locale = useLocale()

  return (
    <TabsContent value="payouts" className="pt-4">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">
            {t('subtabs.payouts', { count: payouts.length })}
          </CardTitle>
          <CardDescription className="text-xs">
            {t('payoutTable.description')}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="space-y-3 p-8">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : payouts.length === 0 ? (
            <div className="text-muted-foreground py-12 text-center text-sm">
              {t('emptyPayouts')}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('columns.date')}</TableHead>
                    <TableHead>{t('columns.affiliate')}</TableHead>
                    <TableHead className="text-right">
                      {t('columns.amount')}
                    </TableHead>
                    <TableHead>{t('columns.payoutChannel')}</TableHead>
                    <TableHead className="text-center">
                      {t('columns.status')}
                    </TableHead>
                    <TableHead className="text-right">
                      {t('columns.action')}
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payouts.map((p) => {
                    const cust = p.affiliateAccount?.customer
                    const name =
                      `${cust?.firstName ?? ''} ${cust?.lastName ?? ''}`.trim() ||
                      cust?.email ||
                      t('fallbacks.affiliate')

                    return (
                      <TableRow key={p.id}>
                        <TableCell className="text-muted-foreground text-xs">
                          {new Date(p.createdAt).toLocaleDateString(
                            locale === 'th' ? 'th-TH' : 'en-US',
                          )}
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="text-foreground text-sm font-bold">
                              {name}
                            </p>
                            <p className="text-muted-foreground text-xs">
                              {p.affiliateAccount?.referralCode}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell className="text-foreground text-right text-base font-black">
                          {formatCurrency(Number(p.amount))}
                        </TableCell>
                        <TableCell className="text-xs">
                          {p.promptPayNumber ? (
                            <span className="text-primary font-bold">
                              {t('fallbacks.promptPay')}: {p.promptPayNumber}
                            </span>
                          ) : (
                            <span>
                              {p.bankName} {p.bankAccountNo} (
                              {p.bankAccountName})
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge
                            variant={
                              p.status === 'PAID'
                                ? 'default'
                                : p.status === 'REJECTED'
                                  ? 'destructive'
                                  : 'outline'
                            }
                            className="text-[11px]"
                          >
                            {p.status === 'PAID'
                              ? t('statusLabels.paid')
                              : p.status === 'REJECTED'
                                ? t('statusLabels.rejected')
                                : t('statusLabels.pendingPayout')}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          {p.status === 'PENDING' ? (
                            <Button
                              size="sm"
                              onClick={() => onManagePayout(p)}
                              className="font-bold shadow-2xs"
                            >
                              {t('statusLabels.manageTransfer')}
                            </Button>
                          ) : p.paymentProof ? (
                            <a
                              href={p.paymentProof}
                              target="_blank"
                              rel="noreferrer"
                              className="text-primary inline-flex items-center gap-1 text-xs hover:underline"
                            >
                              <IconExternalLink className="size-3.5" />
                              {t('statusLabels.viewSlip')}
                            </a>
                          ) : (
                            <span className="text-muted-foreground text-xs">
                              -
                            </span>
                          )}
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </TabsContent>
  )
}

