'use client'

import { useLocale, useTranslations } from 'next-intl'

import { IconExternalLink } from '@tabler/icons-react'

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

export interface PayoutItem {
  id: string
  createdAt: string | Date
  amount: number | string
  promptPayNumber?: string | null
  bankName?: string | null
  bankAccountNo?: string | null
  bankAccountName?: string | null
  status: string
  paymentProof?: string | null
}

interface AffiliatePayoutsTableProps {
  payouts: PayoutItem[]
  formatCurrency: (amount: number, currency?: string) => string
  convert: (amount: number) => number
  currentCurrency?: string
}

export function AffiliatePayoutsTable({
  payouts,
  formatCurrency,
  convert,
  currentCurrency,
}: AffiliatePayoutsTableProps) {
  const t = useTranslations('customer.affiliate')
  const locale = useLocale()

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">{t('payoutTable.title')}</CardTitle>
        <CardDescription className="text-xs">
          {t('payoutTable.description')}
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0 sm:p-6 sm:pt-0">
        {payouts.length === 0 ? (
          <div className="text-muted-foreground py-12 text-center text-sm">
            {t('payoutTable.empty')}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('payoutTable.date')}</TableHead>
                  <TableHead className="text-right">
                    {t('payoutTable.amount')}
                  </TableHead>
                  <TableHead>{t('payoutTable.account')}</TableHead>
                  <TableHead className="text-center">
                    {t('payoutTable.status')}
                  </TableHead>
                  <TableHead>{t('payoutTable.slip')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payouts.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell className="text-muted-foreground text-xs">
                      {new Date(p.createdAt).toLocaleDateString(
                        locale === 'th' ? 'th-TH' : 'en-US',
                      )}
                    </TableCell>
                    <TableCell className="text-foreground text-right font-bold">
                      {formatCurrency(
                        convert(Number(p.amount)),
                        currentCurrency,
                      )}
                    </TableCell>
                    <TableCell className="text-xs">
                      {p.promptPayNumber ? (
                        <span>
                          {t('payoutTable.promptPay')}: {p.promptPayNumber}
                        </span>
                      ) : (
                        <span>
                          {p.bankName} {p.bankAccountNo} ({p.bankAccountName})
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
                    <TableCell className="text-xs">
                      {p.paymentProof ? (
                        <a
                          href={p.paymentProof}
                          target="_blank"
                          rel="noreferrer"
                          className="text-primary inline-flex items-center gap-1 hover:underline"
                        >
                          <IconExternalLink className="size-3.5" />
                          {t('payoutTable.viewSlip')}
                        </a>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
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
