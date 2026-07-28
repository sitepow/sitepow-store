'use client'

import { useState } from 'react'

import { useEmployeePermission } from '@/actions/hooks/employee'
import { useInventory } from '@/actions/hooks/inventory'
import { StorePagination } from '@/app/sites/[domain]/_components/Pagination'
import { ALL_STORES, useStoreFilter } from '@/stores/use-store-filter'
import { formatCurrency, formatNumber } from '@/utils/pricing'
import { IconAlertCircle, IconAlertTriangle } from '@tabler/icons-react'

import { ActionRequiredAlert } from '@/components/ActionRequiredAlert'
import { TableEmptyRow } from '@/components/TableEmptyRow'
import { TableLoadingRow } from '@/components/TableLoadingRow'
import { Badge } from '@/components/ui/badge'
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
  const { selectedStoreId } = useStoreFilter()
  const [page, setPage] = useState(1)

  const {
    canViewInventory,
    canDeleteInventory,
    canUpdateInventory,
    isLoading: isPermissionLoading,
  } = useEmployeePermission()

  const { data: { data: stocks = [], meta } = {}, isLoading } = useInventory({
    storeId: selectedStoreId,
    page,
    limit: 10,
  })

  if (selectedStoreId === ALL_STORES) {
    return <ActionRequiredAlert />
  }

  if (!isPermissionLoading && !canViewInventory) {
    return (
      <ActionRequiredAlert
        title="ไม่มีสิทธิ์เข้าถึง"
        description="คุณไม่มีสิทธิ์ในการจัดการข้อมูลคลังสินค้าของสาขาหรือร้านค้านี้"
      />
    )
  }

  const totalColumns = canViewInventory ? 9 : 8
  const canManageInventory = canDeleteInventory || canUpdateInventory

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>รหัสสินค้า</TableHead>
              <TableHead>สินค้า</TableHead>
              <TableHead>ตัวเลือก</TableHead>
              <TableHead>SKU</TableHead>
              <TableHead>สาขา</TableHead>
              <TableHead className="text-end">คงเหลือ</TableHead>
              <TableHead className="text-end">ขั้นต่ำ</TableHead>
              <TableHead>สถานะ</TableHead>
              {canManageInventory && (
                <TableHead className="text-right">จัดการ</TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {(isLoading || isPermissionLoading) && stocks.length === 0 ? (
              <TableLoadingRow colSpan={totalColumns} />
            ) : stocks.length === 0 ? (
              <TableEmptyRow
                colSpan={totalColumns}
                title="ไม่พบข้อมูลสต็อกสินค้า"
              />
            ) : (
              stocks.map((stock) => {
                const isLow =
                  stock.quantity <= stock.minStock && stock.minStock > 0
                const isOut = stock.quantity === 0

                return (
                  <TableRow key={stock.id}>
                    <TableCell>{stock.id}</TableCell>
                    <TableCell className="max-w-72 min-w-72 wrap-break-word whitespace-pre-line">
                      <div className="flex flex-col">
                        <span>{stock.variant.product.title}</span>
                        <span className="text-muted-foreground text-xs">
                          {stock.variant.product.slug}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="max-w-72 min-w-72 wrap-break-word whitespace-pre-line">
                      <div className="flex flex-col">
                        <span>{stock.variant.title}</span>
                        <span className="text-muted-foreground text-xs">
                          รหัสตัวเลือกสินค้า: {stock.variant.id}
                        </span>
                        <span className="text-muted-foreground text-xs">
                          ราคา: {formatCurrency(Number(stock.variant.price))}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-muted-foreground text-sm">
                        {stock.variant.sku || '-'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={stock.branch.isMain ? 'default' : 'outline'}
                      >
                        {stock.branch.name}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-end">
                      <Badge variant="outline">
                        {formatNumber(stock.quantity)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-end">
                      <Badge variant="outline">
                        {formatNumber(stock.minStock)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {isOut ? (
                        <Badge variant="destructive">
                          <IconAlertCircle /> หมด
                        </Badge>
                      ) : isLow ? (
                        <Badge className="bg-yellow-500 hover:bg-yellow-500">
                          <IconAlertTriangle /> ใกล้หมด
                        </Badge>
                      ) : (
                        <Badge variant="outline">ปกติ</Badge>
                      )}
                    </TableCell>
                    {canManageInventory && (
                      <TableCell className="space-x-2 text-right">
                        <StockAdjustmentDialog
                          variantId={stock.variant.id}
                          variantLabel={`${stock.variant.product.title} · ${stock.variant.title}`}
                          branchId={stock.branch.id}
                          branchName={stock.branch.name}
                        />
                        <StockTransferDialog
                          variantId={stock.variant.id}
                          variantLabel={`${stock.variant.product.title} · ${stock.variant.title}`}
                          fromBranchId={stock.branch.id}
                          fromBranchName={stock.branch.name}
                        />
                        <StockEditDialog stock={stock} />
                      </TableCell>
                    )}
                  </TableRow>
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
    </>
  )
}
