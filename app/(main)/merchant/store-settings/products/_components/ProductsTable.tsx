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
import { IconEdit, IconPackage, IconShoppingCart } from '@tabler/icons-react'

import { DeleteButton } from '@/components/shared/DeleteButton'
import { ProductImage } from '@/components/brand/ProductImage'
import { CreatePurchaseOrderDialog } from '@/components/procurement'
import { TableEmptyRow } from '@/components/table/TableEmptyRow'
import { TableLoadingRow } from '@/components/table/TableLoadingRow'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
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
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([])

  const { mutate: deleteProduct, isPending: isDeleting } = useDeleteProduct()
  const { data: { data: products = [], meta } = {}, isLoading } = useProducts({
    storeId: selectedStoreId,
    page,
    limit: 10,
  })

  if (!isMounted) {
    return null
  }

  const allPageProductIds = products.map((p) => p.id)
  const isAllSelected =
    allPageProductIds.length > 0 &&
    allPageProductIds.every((id) => selectedProductIds.includes(id))

  const handleToggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedProductIds((prev) =>
        prev.filter((id) => !allPageProductIds.includes(id)),
      )
    } else {
      setSelectedProductIds((prev) =>
        Array.from(new Set([...prev, ...allPageProductIds])),
      )
    }
  }

  const handleToggleSelect = (productId: string) => {
    setSelectedProductIds((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId],
    )
  }

  const selectedProducts = products.filter((p) =>
    selectedProductIds.includes(p.id),
  )

  return (
    <div className="space-y-6">
      <ProductQuotaCard />
      {selectedProductIds.length > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-card text-card-foreground border border-border rounded-xl shadow-sm animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-2.5">
            <span className="inline-flex items-center justify-center size-6 rounded-full bg-primary text-primary-foreground font-bold text-xs">
              {selectedProductIds.length}
            </span>
            <span className="text-xs sm:text-sm font-semibold">
              เลือกแล้ว {selectedProductIds.length} รายการ
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedProductIds([])}
              className="text-xs h-8"
            >
              ล้างการเลือก
            </Button>
            <CreatePurchaseOrderDialog
              storeId={selectedStoreId}
              selectedProducts={selectedProducts}
              onSuccess={() => setSelectedProductIds([])}
              trigger={
                <Button
                  size="sm"
                  className="gap-1.5 text-xs h-8 font-semibold shadow-xs"
                >
                  <IconShoppingCart size={15} />
                  <span>ออกใบสั่งซื้อของ ({selectedProductIds.length})</span>
                </Button>
              }
            />
          </div>
        </div>
      )}
      <div className="overflow-x-auto rounded-md border">
        <Table className="min-w-225 border-separate border-spacing-0">
          <TableHeader>
            <TableRow>
              <TableHead className="w-12 text-center bg-background sticky left-0 z-20 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">
                <div className="flex items-center justify-center">
                  <Checkbox
                    checked={isAllSelected}
                    onCheckedChange={handleToggleSelectAll}
                    aria-label="เลือกทั้งหมดในหน้านี้"
                  />
                </div>
              </TableHead>
              <TableHead className="bg-background sticky left-12 z-20 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">
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
              <TableLoadingRow colSpan={8} />
            ) : products.length === 0 ? (
              <TableEmptyRow colSpan={8} title="ไม่พบรายการสินค้า" />
            ) : (
              products.map((product) => {
                const isSelected = selectedProductIds.includes(product.id)
                const basePrice = product.variants?.[0]?.price
                  ? Number(product.variants[0].price)
                  : 0

                return (
                  <TableRow
                    key={product.id}
                    className={`hover:bg-muted/50 ${isSelected ? 'bg-primary/5' : ''}`}
                  >
                    <TableCell className="text-center bg-background hover:bg-muted/50 sticky left-0 z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">
                      <div className="flex items-center justify-center">
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={() => handleToggleSelect(product.id)}
                          aria-label={`เลือก ${product.title}`}
                        />
                      </div>
                    </TableCell>
                    <TableCell className="bg-background hover:bg-muted/50 sticky left-12 z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">
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
                      <CreatePurchaseOrderDialog
                        storeId={selectedStoreId}
                        selectedProducts={[product]}
                        trigger={
                          <Button
                            variant="outline"
                            size="icon-lg"
                            title="ออกใบสั่งซื้อสินค้านี้"
                          >
                            <IconShoppingCart size={16} />
                          </Button>
                        }
                      />
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
