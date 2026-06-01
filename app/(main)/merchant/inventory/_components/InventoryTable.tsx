'use client'

import { useState } from 'react'

import { useInventory } from '@/actions/hooks/inventory'
import { StorePagination } from '@/app/sites/[domain]/_components/Pagination'
import { useStoreFilter } from '@/stores/use-store-filter'
import { formatCurrency, formatNumber } from '@/utils/pricing'

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

  const { data: { data: stocks = [], meta } = {}, isLoading } = useInventory({
    storeId: selectedStoreId,
    page,
    limit: 10,
  })

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>สินค้า</TableHead>
              <TableHead>ตัวเลือก</TableHead>
              <TableHead>SKU</TableHead>
              <TableHead>สาขา</TableHead>
              <TableHead>คงเหลือ</TableHead>
              <TableHead>ขั้นต่ำ</TableHead>
              <TableHead>สถานะ</TableHead>
              <TableHead className="text-right">จัดการ</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && stocks.length === 0 ? (
              <TableLoadingRow colSpan={8} />
            ) : stocks.length === 0 ? (
              <TableEmptyRow colSpan={8} title="ไม่พบข้อมูลสต็อกสินค้า" />
            ) : (
              stocks.map((stock) => {
                const isLow =
                  stock.quantity <= stock.minStock && stock.minStock > 0
                const isOut = stock.quantity === 0

                return (
                  <TableRow key={stock.id}>
                    <TableCell>
                      <span className="font-medium">
                        {stock.variant.product.title}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span>{stock.variant.title}</span>
                        <span className="text-muted-foreground text-xs">
                          {formatCurrency(Number(stock.variant.price))}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-muted-foreground text-sm">
                        {stock.variant.sku}
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
                      <span
                        className={
                          isOut
                            ? 'text-destructive font-semibold'
                            : isLow
                              ? 'font-semibold text-yellow-600'
                              : ''
                        }
                      >
                        {formatNumber(stock.quantity)}
                      </span>
                    </TableCell>
                    <TableCell className="text-end">
                      <span className="text-muted-foreground text-sm">
                        {formatNumber(stock.minStock)}
                      </span>
                    </TableCell>
                    <TableCell>
                      {isOut ? (
                        <Badge variant="destructive">หมด</Badge>
                      ) : isLow ? (
                        <Badge className="bg-yellow-500 hover:bg-yellow-500">
                          ใกล้หมด
                        </Badge>
                      ) : (
                        <Badge variant="outline">ปกติ</Badge>
                      )}
                    </TableCell>
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
