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
import { AffiliateReferralItem } from '@/types/affiliate'
import { formatCurrency } from '@/utils/pricing'
import { IconCheck, IconX } from '@tabler/icons-react'

interface AffiliateReferralsTabProps {
  referrals: AffiliateReferralItem[]
  isLoading: boolean
  onApproveReferral: (id: string) => void
  onRejectReferral: (id: string) => void
}

export function AffiliateReferralsTab({
  referrals,
  isLoading,
  onApproveReferral,
  onRejectReferral,
}: AffiliateReferralsTabProps) {
  const t = useTranslations('merchant.reseller.affiliate')
  const locale = useLocale()

  return (
    <TabsContent value="referrals" className="pt-4">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">
            {t('subtabs.referrals', { count: referrals.length })}
          </CardTitle>
          <CardDescription className="text-xs">
            {t('referralTable.description')}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="space-y-3 p-8">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : referrals.length === 0 ? (
            <div className="text-muted-foreground py-12 text-center text-sm">
              {t('emptyReferrals')}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('columns.date')}</TableHead>
                    <TableHead>{t('columns.orderNumber')}</TableHead>
                    <TableHead>{t('columns.affiliate')}</TableHead>
                    <TableHead className="text-right">
                      {t('columns.orderTotal')}
                    </TableHead>
                    <TableHead className="text-right">
                      {t('columns.commissionRate')}
                    </TableHead>
                    <TableHead className="text-right">
                      {t('columns.commission')}
                    </TableHead>
                    <TableHead className="text-center">
                      {t('columns.status')}
                    </TableHead>
                    <TableHead className="text-right">
                      {t('columns.action')}
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {referrals.map((r) => {
                    const cust = r.affiliateAccount?.customer
                    const name =
                      `${cust?.firstName ?? ''} ${cust?.lastName ?? ''}`.trim() ||
                      t('fallbacks.affiliate')

                    return (
                      <TableRow key={r.id}>
                        <TableCell className="text-muted-foreground text-xs">
                          {new Date(r.createdAt).toLocaleDateString(
                            locale === 'th' ? 'th-TH' : 'en-US',
                          )}
                        </TableCell>
                        <TableCell className="text-xs font-semibold">
                          {r.order?.orderNumber}
                        </TableCell>
                        <TableCell>
                          <div>
                            <span className="text-foreground text-xs font-semibold">
                              {name}
                            </span>
                            <Badge
                              variant="outline"
                              className="ml-2 text-[10px]"
                            >
                              {r.affiliateAccount?.referralCode}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {formatCurrency(Number(r.orderAmount))}
                        </TableCell>
                        <TableCell className="text-muted-foreground text-right text-xs">
                          {Number(r.commissionRate)}%
                        </TableCell>
                        <TableCell className="text-primary text-right font-black">
                          +{formatCurrency(Number(r.commissionAmount))}
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge
                            variant={
                              r.status === 'APPROVED' || r.status === 'PAID'
                                ? 'default'
                                : r.status === 'REJECTED'
                                  ? 'destructive'
                                  : 'secondary'
                            }
                            className="text-[11px]"
                          >
                            {r.status === 'APPROVED'
                              ? t('statusLabels.approved')
                              : r.status === 'PAID'
                                ? t('statusLabels.paid')
                                : r.status === 'REJECTED'
                                  ? t('statusLabels.rejected')
                                  : t('statusLabels.pending')}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          {r.status === 'PENDING' ? (
                            <div className="flex items-center justify-end gap-1.5">
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-8 px-2 text-emerald-600 hover:text-emerald-700"
                                onClick={() => onApproveReferral(r.id)}
                              >
                                <IconCheck className="mr-1 size-3.5" />
                                {t('statusLabels.approveBtn')}
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="text-destructive hover:text-destructive h-8 px-2"
                                onClick={() => onRejectReferral(r.id)}
                              >
                                <IconX className="size-3.5" />
                              </Button>
                            </div>
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

