'use client'

import { useCurrentStore } from '@/hooks/use-current-store'

import React, { useState } from 'react'

import { useTranslations } from 'next-intl'

import { useEmployeePermission } from '@/actions/hooks/employee'
import { useInventory } from '@/actions/hooks/inventory'
import { StorePagination } from '@/app/sites/[domain]/_components/Pagination'
import { useBranchFilter } from '@/stores/use-branch-filter'
import { ALL_STORES, useStoreFilter } from '@/stores/use-store-filter'
import { formatCurrency, formatNumber } from '@/utils/pricing'
import {
  IconAlertCircle,
  IconAlertTriangle,
  IconChevronDown,
  IconChevronRight,
  IconCornerDownRight,
  IconLock,
} from '@tabler/icons-react'

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

import { StockAdjustmentDialog } from './StockAdjustmentDialog'
import { StockEditDialog } from './StockEditDialog'
import { StockTransferDialog } from './StockTransferDialog'

export function InventoryTable() {
  const { currentStore, store } = useCurrentStore()
  const t = useTranslations('merchant.inventory')
  const { selectedStoreId } = useStoreFilter()
  const { selectedBranchId } = useBranchFilter()
  const [page, setPage] = useState(1)
  const [expandedProductIds, setExpandedProductIds] = useState<
    Record<string, boolean>
  >({})

  const {
    canViewInventory,
    canDeleteInventory,
    canUpdateInventory,
    isLoading: isPermissionLoading,
  } = useEmployeePermission()

  const { data: { data: products = [], meta } = {}, isLoading } = useInventory({
    storeId: selectedStoreId,
    branchId: selectedBranchId,
    page,
    limit: 10,
  })

  const toggleRow = (productId: string) => {
    setExpandedProductIds((prev) => ({
      ...prev,
      [productId]: !prev[productId],
    }))
  }

  if (selectedStoreId === ALL_STORES) {
    return <ActionRequiredAlert />
  }

  if (!isPermissionLoading && !canViewInventory) {
    return (
      <ActionRequiredAlert
        icon={<IconLock />}
        title={t('noAccessTitle')}
        description={t('noAccessDescription')}
      />
    )
  }

  const canManageInventory = canDeleteInventory || canUpdateInventory
  const totalColumns = canManageInventory ? 6 : 5

  return (
    <div
      className="space-y-4"
      style={{
        '--primary': currentStore?.primaryColor ?? store?.primaryColor,
      } as React.CSSProperties}
    >
      <div className="overflow-x-auto rounded-md border">
        <Table className="min-w-200">
          <TableHeader>
            <TableRow>
              <TableHead className="bg-background sticky left-0 z-20 w-12" />
              <TableHead className="bg-background sticky left-12 z-20 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">
                {t('columns.image')}
              </TableHead>
              <TableHead>{t('columns.product')}</TableHead>
              <TableHead className="text-center">
                {t('columns.variantCount')}
              </TableHead>
              <TableHead className="text-end">
                {t('columns.totalStock')}
              </TableHead>
              <TableHead className="text-right">
                {t('columns.actions')}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {(isLoading || isPermissionLoading) && products.length === 0 ? (
              <TableLoadingRow colSpan={totalColumns} />
            ) : products.length === 0 ? (
              <TableEmptyRow colSpan={totalColumns} title={t('empty')} />
            ) : (
              products.map((product) => {
                const isExpanded = !!expandedProductIds[product.id]
                const variants = product.variants || []

                const totalStock = variants.reduce((acc, v) => {
                  const stockQty = v.stocks?.[0]?.quantity || 0
                  return acc + stockQty
                }, 0)

                return (
                  <React.Fragment key={product.id}>
                    <TableRow
                      className="hover:bg-muted/50 cursor-pointer"
                      onClick={() => toggleRow(product.id)}
                    >
                      <TableCell className="bg-background hover:bg-muted/50 sticky left-0 z-10">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-muted-foreground size-6 p-0"
                        >
                          {isExpanded ? (
                            <IconChevronDown size={16} />
                          ) : (
                            <IconChevronRight size={16} />
                          )}
                        </Button>
                      </TableCell>
                      <TableCell className="bg-background hover:bg-muted/50 sticky left-12 z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">
                        <ProductImage
                          src={product.images?.[0]?.url}
                          alt={product.title}
                        />
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium">{product.title}</span>
                          <span className="text-muted-foreground">
                            {product.slug}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge>
                          {t('variantItemCount', { count: variants.length })}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-end">
                        <div className="flex items-center gap-2">
                          <span className="text-muted-foreground text-xs">
                            {t('totalPrefix')}
                          </span>
                          <Badge variant="outline">
                            {formatNumber(totalStock)}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation()
                            toggleRow(product.id)
                          }}
                        >
                          {isExpanded ? t('hideVariants') : t('viewVariants')}
                        </Button>
                      </TableCell>
                    </TableRow>
                    {isExpanded &&
                      variants.map((variant) => {
                        const stock = variant.stocks?.[0] || {
                          id: '',
                          quantity: 0,
                          minStock: 0,
                          branch: null,
                        }
                        const isLow =
                          stock.quantity <= stock.minStock && stock.minStock > 0
                        const isOut = stock.quantity === 0

                        return (
                          <TableRow key={variant.id} className="bg-muted/30">
                            <TableCell />
                            <TableCell>
                              <div className="flex items-center gap-3 pl-4">
                                <IconCornerDownRight className="text-muted-foreground size-4 shrink-0" />
                                <ProductImage
                                  src={
                                    variant.image || product.images?.[0]?.url
                                  }
                                  alt={variant.title}
                                />
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex flex-col">
                                <span className="text-sm font-medium">
                                  {variant.title}
                                </span>
                                <span className="text-muted-foreground">
                                  SKU: {variant.sku || '-'} | {t('pricePrefix')}{' '}
                                  {formatCurrency(Number(variant.price))}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell />
                            <TableCell className="text-end">
                              <div className="flex flex-col items-end gap-1">
                                <div className="flex items-center gap-2">
                                  <span className="text-muted-foreground text-xs">
                                    {t('remainingPrefix')}
                                  </span>
                                  <Badge variant="outline">
                                    {formatNumber(stock.quantity)}
                                  </Badge>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="text-muted-foreground text-xs">
                                    {t('minPrefix')}
                                  </span>
                                  <Badge variant="outline">
                                    {formatNumber(stock.minStock)}
                                  </Badge>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex items-center justify-end gap-2">
                                {isOut ? (
                                  <Badge variant="destructive">
                                    <IconAlertCircle size={12} />{' '}
                                    {t('outOfStock')}
                                  </Badge>
                                ) : isLow ? (
                                  <Badge className="bg-yellow-500 hover:bg-yellow-500">
                                    <IconAlertTriangle size={12} />{' '}
                                    {t('lowStock')}
                                  </Badge>
                                ) : (
                                  <Badge variant="outline">
                                    {t('inStock')}
                                  </Badge>
                                )}
                                {canManageInventory && stock.branch && (
                                  <div className="flex items-center space-x-1 pl-2">
                                    <StockAdjustmentDialog
                                      variantId={variant.id}
                                      variantLabel={`${product.title} · ${variant.title}`}
                                      branchId={stock.branch.id}
                                      branchName={stock.branch.name}
                                    />
                                    <StockTransferDialog
                                      variantId={variant.id}
                                      variantLabel={`${product.title} · ${variant.title}`}
                                      fromBranchId={stock.branch.id}
                                      fromBranchName={stock.branch.name}
                                    />
                                    <StockEditDialog stock={stock} />
                                  </div>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        )
                      })}
                  </React.Fragment>
                )
              })
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
    </div>
  )
}
