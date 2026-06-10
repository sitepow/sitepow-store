'use client'

import { useState } from 'react'

import Link from 'next/link'

import { useDeleteProduct, useProducts } from '@/actions/hooks/product'
import { StorePagination } from '@/app/sites/[domain]/_components/Pagination'
import { useStoreFilter } from '@/stores/use-store-filter'
import { formatCurrency } from '@/utils/pricing'
import { IconPackage } from '@tabler/icons-react'

import { DeleteButton } from '@/components/DeleteButton'
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

export function ProductsTable() {
  const { selectedStoreId } = useStoreFilter()
  const [page, setPage] = useState(1)

  const { mutate: deleteProduct, isPending: isDeleting } = useDeleteProduct()
  const { data: { data: products = [], meta } = {}, isLoading } = useProducts({
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
              <TableHead>รหัส</TableHead>
              <TableHead>ชื่อสินค้า</TableHead>
              <TableHead>ร้านค้า</TableHead>
              <TableHead>หมวดหมู่</TableHead>
              <TableHead>ราคาเริ่มต้น</TableHead>
              <TableHead>สถานะ</TableHead>
              <TableHead className="text-right">จัดการ</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && products.length === 0 ? (
              <TableLoadingRow colSpan={7} />
            ) : products.length === 0 ? (
              <TableEmptyRow colSpan={7} title="ไม่พบรายการสินค้า" />
            ) : (
              products.map((product) => {
                const basePrice = product.variants?.[0]?.price
                  ? Number(product.variants[0].price)
                  : 0

                return (
                  <TableRow key={product.id}>
                    <TableCell>{product.id}</TableCell>
                    <TableCell className="max-w-72 min-w-72 wrap-break-word whitespace-pre-line">
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
                        {product.store?.name ?? ''}
                      </Badge>
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
                      <Button variant="outline" size="icon-lg" asChild>
                        <Link href={'/merchant/inventory'}>
                          <IconPackage />
                        </Link>
                      </Button>
                      <DeleteButton
                        isPending={isDeleting}
                        onDelete={() => deleteProduct(product.id)}
                      />
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
