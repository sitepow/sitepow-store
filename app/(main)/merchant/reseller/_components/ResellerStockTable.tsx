'use client'

import { useTranslations } from 'next-intl'

import { useEmployeePermission } from '@/actions/hooks/employee'
import {
  useResellerPayoutSummary,
  useResellerStocks,
} from '@/actions/hooks/reseller'
import { StatsCard } from '@/components/StatsCard'
import { useCurrentStore } from '@/hooks/use-current-store'
import { useResellerFilter } from '@/stores/use-reseller-filter'
import { ALL_STORES, useStoreFilter } from '@/stores/use-store-filter'
import { formatCurrency } from '@/utils/pricing'
import {
  IconPackageExport,
  IconPackageImport,
  IconPencil,
} from '@tabler/icons-react'
import { CheckCircle2, Clock, DollarSign, TrendingUp } from 'lucide-react'

import { ActionRequiredAlert } from '@/components/ActionRequiredAlert'
import { ProductImage } from '@/components/ProductImage'
import { TableEmptyRow } from '@/components/TableEmptyRow'
import { TableLoadingRow } from '@/components/TableLoadingRow'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { TooltipProvider } from '@/components/ui/tooltip'

/* eslint-disable @next/next/no-img-element */

interface ResellerStockTableProps {
  onAcceptStock?: (stock: any) => void
  onReturnStock?: (stock: any) => void
  onEditPrice?: (stock: any) => void
}

export function ResellerStockTable({
  onAcceptStock,
  onReturnStock,
  onEditPrice,
}: ResellerStockTableProps) {
  const { currentStore, store } = useCurrentStore()
  const t = useTranslations('merchant.reseller')
  const { selectedStoreId } = useStoreFilter()
  const { selectedAgreementId } = useResellerFilter()

  const { canViewReseller, canUpdateReseller, canUpdateInventory } =
    useEmployeePermission()

  const { data: stocksRes, isLoading: isStocksLoading } =
    useResellerStocks(selectedAgreementId)
  const { data: summaryRes } = useResellerPayoutSummary(selectedAgreementId)

  const stocks = stocksRes?.data || []
  const summary = summaryRes?.data

  if (selectedStoreId === ALL_STORES) {
    return <ActionRequiredAlert />
  }

  const canAccept = canViewReseller || canUpdateReseller

  const hasAnyAction = stocks.some((stock) => {
    const allocated = stock.allocatedQuantity || 0
    const accepted = stock.acceptedQuantity || 0
    const pendingQuantity = allocated - accepted
    const isAcceptedAll = pendingQuantity <= 0

    return canUpdateInventory || (canAccept && !isAcceptedAll)
  })

  const showActionColumn = hasAnyAction
  const totalColumns = (showActionColumn ? 8 : 7) + 1

  return (
    <div
      className="space-y-4"
      style={
        {
          '--primary': currentStore?.primaryColor ?? store?.primaryColor,
        } as React.CSSProperties
      }
    >
      {selectedAgreementId && summary && (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatsCard
            title={t('stats.totalGrossSales')}
            value={formatCurrency(Number(summary.totalGrossSales || 0))}
            description={t('stats.totalGrossSalesDesc')}
            icon={DollarSign}
          />
          <StatsCard
            title={t('stats.totalCommission')}
            value={formatCurrency(Number(summary.totalCommission || 0))}
            description={
              summary.commissionRate !== null &&
              summary.commissionRate !== undefined
                ? t('stats.commissionRateDesc', {
                    rate: summary.commissionRate,
                  })
                : t('stats.productCommissionDesc')
            }
            icon={TrendingUp}
          />
          <StatsCard
            title={t('stats.totalPaidAmount')}
            value={formatCurrency(Number(summary.totalPaidAmount || 0))}
            description={t('stats.totalPaidAmountDesc')}
            icon={CheckCircle2}
          />
          <StatsCard
            title={t('stats.pendingPayoutAmount')}
            value={formatCurrency(Number(summary.pendingPayoutAmount || 0))}
            description={t('stats.pendingPayoutAmountDesc')}
            icon={Clock}
          />
        </div>
      )}
      <div className="overflow-x-auto rounded-md border">
        <TooltipProvider>
          <Table className="min-w-250 border-separate border-spacing-0">
            <TableHeader>
              <TableRow>
                <TableHead className="bg-background sticky left-0 z-20 w-16 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">
                  {t('columns.image')}
                </TableHead>
                <TableHead>{t('columns.productVariant')}</TableHead>
                <TableHead className="text-right">
                  {t('columns.retailAndWholesale')}
                </TableHead>
                <TableHead className="text-center">
                  {t('columns.stockMovement')}
                </TableHead>
                <TableHead className="text-center">
                  {t('columns.remainingForSale')}
                </TableHead>
                <TableHead className="text-right">
                  {t('columns.grossSales')}
                </TableHead>
                <TableHead className="text-right">
                  {t('columns.costToClear')}
                </TableHead>
                <TableHead className="text-center">
                  {t('columns.acceptStatus')}
                </TableHead>
                {showActionColumn && (
                  <TableHead className="text-right">
                    {t('columns.actions')}
                  </TableHead>
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {isStocksLoading ? (
                <TableLoadingRow colSpan={totalColumns} />
              ) : !selectedAgreementId ? (
                <TableEmptyRow
                  colSpan={totalColumns}
                  title={t('table.selectAgreementPrompt')}
                />
              ) : stocks.length === 0 ? (
                <TableEmptyRow
                  colSpan={totalColumns}
                  title={t('table.noStocks')}
                />
              ) : (
                stocks.map((stock) => {
                  const allocated = stock.allocatedQuantity || 0
                  const accepted = stock.acceptedQuantity || 0
                  const sold = stock.soldQuantity || 0
                  const remaining = accepted - sold

                  const retailPrice = Number(stock.variant?.price || 0)
                  const customPrice = stock.customPrice
                    ? Number(stock.customPrice)
                    : retailPrice
                  const totalRevenue = sold * retailPrice
                  const merchantAmount = sold * customPrice

                  const pendingQuantity = allocated - accepted
                  const isAcceptedAll = pendingQuantity <= 0

                  const imageUrl =
                    stock.variant?.image ||
                    stock.variant?.product?.images?.find(
                      (img: any) => img.isPrimary,
                    )?.url ||
                    stock.variant?.product?.images?.[0]?.url

                  return (
                    <TableRow key={stock.id} className="hover:bg-muted/50">
                      <TableCell className="bg-background hover:bg-muted/50 sticky left-0 z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">
                        <ProductImage
                          src={imageUrl}
                          alt={stock.variant.title}
                        />
                      </TableCell>
                      <TableCell>
                        <div className="flex max-w-72 min-w-72 flex-col wrap-break-word whitespace-pre-line">
                          <p className="font-medium">
                            {stock.variant?.product?.title || '-'}
                          </p>
                          <p className="text-muted-foreground">
                            {stock.variant?.title}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <p className="font-medium">
                          {formatCurrency(retailPrice)}
                        </p>
                        <div className="text-muted-foreground flex items-center justify-end gap-1 text-xs">
                          <span>
                            {t('table.wholesaleLabel', {
                              price: formatCurrency(customPrice),
                            })}
                          </span>
                          {canUpdateInventory && onEditPrice && (
                            <Button
                              variant="ghost"
                              size="icon-lg"
                              className="hover:bg-muted size-6"
                              title={t('table.customPriceTooltip')}
                              onClick={() => onEditPrice(stock)}
                            >
                              <IconPencil className="size-3" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="mx-auto flex w-36 flex-col gap-1.5">
                          <div className="bg-muted flex h-2 w-full overflow-hidden rounded-full">
                            <div
                              className="bg-orange-500 transition-all"
                              style={{
                                width:
                                  allocated > 0
                                    ? `${((accepted - sold) / allocated) * 100}%`
                                    : '0%',
                              }}
                              title={t('table.tooltipRemaining', {
                                count: accepted - sold,
                              })}
                            />
                            <div
                              className="bg-emerald-500 transition-all"
                              style={{
                                width:
                                  allocated > 0
                                    ? `${(sold / allocated) * 100}%`
                                    : '0%',
                              }}
                              title={t('table.tooltipSold', { count: sold })}
                            />
                          </div>
                          <div className="text-muted-foreground flex justify-between text-[11px]">
                            <span>
                              {t('table.movementSent', { count: allocated })}
                            </span>
                            <span className="font-medium text-orange-500">
                              {t('table.movementAccepted', { count: accepted })}
                            </span>
                            <span className="font-medium text-emerald-500">
                              {t('table.movementSold', { count: sold })}
                            </span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge
                          variant={remaining > 0 ? 'outline' : 'secondary'}
                        >
                          {t('table.unitPieces', { count: remaining })}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {formatCurrency(totalRevenue)}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {formatCurrency(merchantAmount)}
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant={isAcceptedAll ? 'outline' : 'default'}>
                          {isAcceptedAll
                            ? t('table.statusAcceptedAll')
                            : t('table.statusPendingAccept', {
                                count: pendingQuantity,
                              })}
                        </Badge>
                      </TableCell>
                      {showActionColumn && (
                        <TableCell className="space-x-1 text-right whitespace-nowrap">
                          {canUpdateInventory && (
                            <Button
                              variant="outline"
                              size="icon-lg"
                              title={t('table.returnStockTooltip')}
                              disabled={allocated - sold <= 0}
                              onClick={() => onReturnStock?.(stock)}
                            >
                              <IconPackageExport />
                            </Button>
                          )}
                          {canAccept && !isAcceptedAll && (
                            <Button
                              variant="outline"
                              size="icon-lg"
                              title={
                                isAcceptedAll
                                  ? t('table.statusAcceptedAll')
                                  : t('table.acceptStockTooltip')
                              }
                              disabled={isAcceptedAll}
                              onClick={() => onAcceptStock?.(stock)}
                            >
                              <IconPackageImport />
                            </Button>
                          )}
                        </TableCell>
                      )}
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </TooltipProvider>
      </div>
    </div>
  )
}
