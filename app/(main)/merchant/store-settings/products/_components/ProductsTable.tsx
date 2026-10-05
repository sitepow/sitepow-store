'use client'

import { useState } from 'react'

import Link from 'next/link'

import {
  useDeleteProduct,
  useProducts,
} from '@/actions/catalog/product/hooks'
import { StorePagination } from '@/app/sites/[domain]/_components/shared/Pagination'
import { useIsMounted } from '@/hooks/use-is-mounted'
import { useStoreFilter } from '@/stores/merchant/use-store-filter'
import { formatCurrency } from '@/utils/formatting/number'
import { IconEdit, IconPackage } from '@tabler/icons-react'

import { DeleteButton } from '@/components/shared/DeleteButton'
import { ProductImage } from '@/components/brand/ProductImage'
import { TableEmptyRow } from '@/components/table/TableEmptyRow'
import { TableLoadingRow } from '@/components/table/TableLoadingRow'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ProductQuotaCard } from './ProductQuotaCard'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

export function ProductsTable() {
  const isMounted = useIsMounted()
  const { selectedStoreId } = useStoreFilter()
  const [page, setPage] = useState(1)

  const { mutate: deleteProduct, isPending: isDeleting } = useDeleteProduct()
  const { data: { data: products = [], meta } = {}, isLoading } = useProducts({
    storeId: selectedStoreId,
    page,
    limit: 10,
  })

  if (!isMounted) {
    return null
  }

  return (
    <div className="space-y-6">
      <ProductQuotaCard />
      <div className="overflow-x-auto rounded-md border">
        <Table className="min-w-225 border-separate border-spacing-0">
          <TableHeader>
            <TableRow>
              <TableHead className="bg-background sticky left-0 z-20 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">
                รูปภาพสินค้า
              </TableHead>
              <TableHead>ชื่อสินค้า/Slug</TableHead>
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
                  <TableRow key={product.id} className="hover:bg-muted/50">
                    <TableCell className="bg-background hover:bg-muted/50 sticky left-0 z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">
                      <ProductImage src={product.images?.[0]?.url} />
                    </TableCell>
                    <TableCell className="max-w-72 min-w-72 wrap-break-word whitespace-pre-line">
                      <div className="flex flex-col">
                        <span className="font-medium">{product.title}</span>
                        <span className="text-muted-foreground">
                          {product.slug}
                        </span>
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
                      {product.isPublished ? (
                        <Badge>แสดงหน้าร้าน</Badge>
                      ) : (
                        <Badge variant="outline">ซ่อนหน้าร้าน</Badge>
                      )}
                    </TableCell>
                    <TableCell className="space-x-2 text-right">
                      <Button variant="outline" size="icon-lg" asChild>
                        <Link href={'/merchant/inventory'}>
                          <IconPackage />
                        </Link>
                      </Button>
                      <Button variant="outline" size="icon-lg" asChild>
                        <Link
                          href={`/merchant/store-settings/products/create/${product.id}`}
                        >
                          <IconEdit className="size-4" />
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
    </div>
  )
}
