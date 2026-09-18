'use client'

import { useTranslations } from 'next-intl'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
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
import { AffiliateAccountItem } from '@/types/affiliate'
import { formatCurrency, formatNumber } from '@/utils/pricing'

interface AffiliateAccountsTabProps {
  affiliates: AffiliateAccountItem[]
  isLoading: boolean
  search: string
  onSearchChange: (val: string) => void
}

export function AffiliateAccountsTab({
  affiliates,
  isLoading,
  search,
  onSearchChange,
}: AffiliateAccountsTabProps) {
  const t = useTranslations('merchant.reseller.affiliate')

  return (
    <TabsContent value="affiliates" className="space-y-4 pt-4">
      <div className="flex items-center justify-between gap-3">
        <Input
          placeholder={t('searchPlaceholder')}
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="max-w-sm text-xs sm:text-sm"
        />
      </div>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="space-y-3 p-8">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : affiliates.length === 0 ? (
            <div className="text-muted-foreground py-12 text-center text-sm">
              {t('emptyAffiliates')}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('columns.affiliate')}</TableHead>
                    <TableHead>{t('columns.referralCode')}</TableHead>
                    <TableHead className="text-right">
                      {t('columns.referredOrders')}
                    </TableHead>
                    <TableHead className="text-right">
                      {t('columns.balance')}
                    </TableHead>
                    <TableHead className="text-right">
                      {t('columns.totalEarned')}
                    </TableHead>
                    <TableHead className="text-right">
                      {t('columns.totalWithdrawn')}
                    </TableHead>
                    <TableHead>{t('columns.payoutAccount')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {affiliates.map((a) => {
                    const name =
                      `${a.customer?.firstName ?? ''} ${a.customer?.lastName ?? ''}`.trim() ||
                      a.customer?.email ||
                      t('fallbacks.customer')
                    return (
                      <TableRow key={a.id}>
                        <TableCell>
                          <div>
                            <p className="text-foreground text-sm font-bold">
                              {name}
                            </p>
                            <p className="text-muted-foreground text-xs">
                              {a.customer?.email || a.customer?.phone || '-'}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className="text-xs font-bold"
                          >
                            {a.referralCode}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right font-semibold">
                          {formatNumber(a._count?.referrals ?? 0)}
                        </TableCell>
                        <TableCell className="text-primary text-right font-black">
                          {formatCurrency(Number(a.balance))}
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {formatCurrency(Number(a.totalEarned))}
                        </TableCell>
                        <TableCell className="text-muted-foreground text-right text-xs">
                          {formatCurrency(Number(a.totalWithdrawn))}
                        </TableCell>
                        <TableCell className="text-xs">
                          {a.promptPayNumber ? (
                            <span>
                              {t('fallbacks.promptPay')}: {a.promptPayNumber}
                            </span>
                          ) : a.bankName ? (
                            <span>
                              {a.bankName} {a.bankAccountNo}
                            </span>
                          ) : (
                            <span className="text-muted-foreground">-</span>
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

