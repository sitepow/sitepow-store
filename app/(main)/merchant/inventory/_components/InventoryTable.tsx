'use client'

import { useState } from 'react'

import { useInventory } from '@/actions/hooks/inventory'
import { StorePagination } from '@/app/sites/[domain]/_components/Pagination'
import { useStoreFilter } from '@/stores/use-store-filter'
import { formatCurrency, formatNumber } from '@/utils/pricing'
import { IconAlertCircle, IconAlertTriangle } from '@tabler/icons-react'

import { TableEmptyRow } from '@/components/TableEmptyRow'
import { TableImage } from '@/components/TableImage'
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
              {/* <TableHead>รหัสสินค้า</TableHead> */}
              <TableHead>รูปภาพสินค้า</TableHead>
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
                    {/* <TableCell>{stock.id}</TableCell> */}
                    <TableCell>
                      <TableImage />
                    </TableCell>
                    <TableCell className="max-w-72 min-w-72 wrap-break-word whitespace-pre-line">
                      <div className="flex flex-col">
                        <span>{stock.variant.product.title}</span>
                        <span className="text-muted-foreground text-xs">
                          รหัสสินค้า: {stock.variant.product.id}
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
