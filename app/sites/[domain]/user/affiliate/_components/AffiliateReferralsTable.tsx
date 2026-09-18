'use client'

import { useLocale, useTranslations } from 'next-intl'

import { Badge } from '@/components/ui/badge'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

export interface ReferralItem {
  id: string
  createdAt: string | Date
  orderId?: string | null
  order?: { orderNumber?: string } | null
  orderAmount: number | string
  commissionRate: number | string
  commissionAmount: number | string
  status: string
}

interface AffiliateReferralsTableProps {
  referrals: ReferralItem[]
  formatCurrency: (amount: number, currency?: string) => string
  convert: (amount: number) => number
  currentCurrency?: string
}

export function AffiliateReferralsTable({
  referrals,
  formatCurrency,
  convert,
  currentCurrency,
}: AffiliateReferralsTableProps) {
  const t = useTranslations('customer.affiliate')
  const locale = useLocale()

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">{t('referralTable.title')}</CardTitle>
        <CardDescription className="text-xs">
          {t('referralTable.description')}
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0 sm:p-6 sm:pt-0">
        {referrals.length === 0 ? (
          <div className="text-muted-foreground py-12 text-center text-sm">
            {t('referralTable.empty')}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('referralTable.date')}</TableHead>
                  <TableHead>{t('referralTable.orderNumber')}</TableHead>
                  <TableHead className="text-right">
                    {t('referralTable.orderTotal')}
                  </TableHead>
                  <TableHead className="text-right">
                    {t('referralTable.rate')}
                  </TableHead>
                  <TableHead className="text-right">
                    {t('referralTable.commission')}
                  </TableHead>
                  <TableHead className="text-center">
                    {t('referralTable.status')}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {referrals.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell className="text-muted-foreground text-xs">
                      {new Date(r.createdAt).toLocaleDateString(
                        locale === 'th' ? 'th-TH' : 'en-US',
                      )}
                    </TableCell>
                    <TableCell className="text-xs font-semibold">
                      {r.order?.orderNumber || r.orderId}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {formatCurrency(
                        convert(Number(r.orderAmount)),
                        currentCurrency,
                      )}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-right text-xs">
                      {Number(r.commissionRate)}%
                    </TableCell>
                    <TableCell className="text-primary text-right font-bold">
                      +
                      {formatCurrency(
                        convert(Number(r.commissionAmount)),
                        currentCurrency,
                      )}
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
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
