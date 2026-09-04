'use client'

import { ComponentProps, useState } from 'react'

import { useTranslations } from 'next-intl'

import { useCustomerPoints, useLoyaltySettings } from '@/actions/hooks/loyalty'
import { StorePagination } from '@/app/sites/[domain]/_components/Pagination'
import { useStoreFilter } from '@/stores/use-store-filter'
import { formatCurrency, formatNumber } from '@/utils/pricing'
import { formatPromptPay } from '@/utils/slip'
import { IconHistory, IconSearch } from '@tabler/icons-react'

import { TableEmptyRow } from '@/components/TableEmptyRow'
import { TableLoadingRow } from '@/components/TableLoadingRow'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

import { cn } from '@/lib/utils'

export function CustomerPointsTable({
  className,
  ...props
}: ComponentProps<typeof Card>) {
  const t = useTranslations('merchant.loyalty')
  const { selectedStoreId } = useStoreFilter()
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')

  const { data: settings } = useLoyaltySettings(selectedStoreId)
  const { data: { data: customers = [], meta } = {}, isLoading } =
    useCustomerPoints({
      storeId: selectedStoreId,
      page,
      limit: 10,
      search,
    })

  const isEnabled = settings?.isPointsEnabled ?? false

  return (
    <Card className={cn('h-fit', className)} {...props}>
      <CardHeader>
        <CardTitle>{t('table.title')}</CardTitle>
        <CardDescription>{t('table.description')}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="relative">
          <IconSearch
            className="text-muted-foreground absolute top-2.5 left-2.5"
            size={16}
          />
          <Input
            placeholder={t('table.searchPlaceholder')}
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setPage(1)
            }}
            className="pl-9 text-xs"
            disabled={!isEnabled}
          />
        </div>
        <div className="bg-background overflow-hidden rounded-xl border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('columns.customer')}</TableHead>
                <TableHead>{t('columns.phone')}</TableHead>
                <TableHead className="text-right">
                  {t('columns.points')}
                </TableHead>
                <TableHead className="text-right">
                  {t('columns.totalSpent')}
                </TableHead>
                <TableHead className="text-right">
                  {t('columns.actions')}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {!isEnabled ? (
                <TableEmptyRow title={t('table.disabledMessage')} colSpan={5} />
              ) : isLoading && customers.length === 0 ? (
                <TableLoadingRow colSpan={5} />
              ) : customers.length === 0 ? (
                <TableEmptyRow title={t('table.empty')} colSpan={5} />
              ) : (
                customers.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="max-w-72 min-w-72 wrap-break-word whitespace-pre-line">
                      {[item.customer.firstName, item.customer.lastName]
                        .filter(Boolean)
                        .join(' ') || item.customer.email}
                    </TableCell>
                    <TableCell>
                      {item.customer.phone
                        ? formatPromptPay(item.customer.phone)
                        : '-'}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatNumber(item.rewardPoints)}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(item.totalSpent)}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="outline" disabled size="icon-lg">
                        <IconHistory />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
        {meta && meta.totalPages > 1 && (
          <StorePagination
            currentPage={meta.currentPage}
            totalPages={meta.totalPages}
            hasNextPage={meta.hasNextPage}
            hasPreviousPage={meta.hasPreviousPage}
            onPageChange={(newPage) => setPage(newPage)}
          />
        )}
      </CardContent>
    </Card>
  )
}
