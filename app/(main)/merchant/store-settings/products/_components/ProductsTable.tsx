'use client'

import { useState } from 'react'

import { useProducts } from '@/actions/hooks/product'
import { StorePagination } from '@/app/sites/[domain]/_components/Pagination'
import { formatCurrency } from '@/utils/pricing'
import { IconEdit, IconTrash } from '@tabler/icons-react'

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

interface ProductsTableProps {
  storeId: string
  search?: string
  categoryId?: string
}

export function ProductsTable({
  storeId,
  search,
  categoryId,
}: ProductsTableProps) {
  const [page, setPage] = useState(1)

  const { data: { data: products = [], meta } = {}, isLoading } = useProducts({
    storeId,
    page,
    limit: 10,
    search,
    categoryId,
  })

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>รหัส</TableHead>
              <TableHead>ชื่อสินค้า</TableHead>
              <TableHead>หมวดหมู่</TableHead>
              <TableHead>ราคาเริ่มต้น</TableHead>
              <TableHead>สถานะ</TableHead>
              <TableHead className="text-right">จัดการ</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && products.length === 0 ? (
              <TableLoadingRow colSpan={6} />
            ) : products.length === 0 ? (
              <TableEmptyRow colSpan={6} title="ไม่พบรายการสินค้า" />
            ) : (
              products.map((product) => {
                const basePrice = product.variants?.[0]?.price
                  ? Number(product.variants[0].price)
                  : 0

                return (
                  <TableRow key={product.id}>
                    <TableCell>{product.id}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="flex flex-col">
                          <span>{product.title}</span>
                          <span className="text-muted-foreground text-xs">
                            {product.slug}
                          </span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {product.category?.title ?? ''}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatCurrency(basePrice)}</TableCell>
                    <TableCell>
                      <Badge>พร้อมขาย</Badge>
                    </TableCell>
                    <TableCell className="space-x-2 text-right">
                      <Button variant="outline" size="icon-lg">
                        <IconEdit />
                      </Button>
                      <Button variant="outline" size="icon-lg">
                        <IconTrash />
                      </Button>
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
