'use client'

import { useState } from 'react'

import { useCategories, useDeleteCategory } from '@/actions/catalog/category/hooks'
import { StorePagination } from '@/app/sites/[domain]/_components/Pagination'
import { useStoreFilter } from '@/stores/use-store-filter'
import { IconEdit } from '@tabler/icons-react'

import { DeleteButton } from '@/components/DeleteButton'
import { ProductImage } from '@/components/ProductImage'
import { TableEmptyRow } from '@/components/TableEmptyRow'
import { TableLoadingRow } from '@/components/TableLoadingRow'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

interface CategoriesTableProps {
  onEdit: (id: string) => void
}

export function CategoriesTable({ onEdit }: CategoriesTableProps) {
  const { selectedStoreId } = useStoreFilter()
  const [page, setPage] = useState(1)

  const { data: { data: categories = [], meta } = {}, isLoading } =
    useCategories({
      storeId: selectedStoreId,
      page,
      limit: 10,
    })

  const deleteCategoryMutation = useDeleteCategory()

  return (
    <>
      <div className="overflow-x-auto rounded-md border">
        <Table className="min-w-175 border-separate border-spacing-0">
          <TableHeader>
            <TableRow>
              <TableHead className="bg-background sticky left-0 z-25 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">
                รูปภาพ
              </TableHead>
              <TableHead>ชื่อหมวดหมู่/Slug</TableHead>
              <TableHead>คำอธิบาย</TableHead>
              <TableHead className="text-right">จัดการ</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && categories.length === 0 ? (
              <TableLoadingRow colSpan={4} />
            ) : categories.length === 0 ? (
              <TableEmptyRow colSpan={4} title="ไม่พบรายการหมวดหมู่" />
            ) : (
              categories.map((category) => (
                <TableRow key={category.id} className="hover:bg-muted/50">
                  <TableCell className="bg-background hover:bg-muted/50 sticky left-0 z-20 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">
                    <ProductImage src={category.image} />
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium">{category.title}</span>
                      <span className="text-muted-foreground">
                        {category.slug}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="max-w-72 min-w-72 wrap-break-word whitespace-pre-line">
                    <span className="text-muted-foreground text-sm">
                      {category.description || '-'}
                    </span>
                  </TableCell>
                  <TableCell className="space-x-2 text-right">
                    <Button
                      variant="outline"
                      size="icon-lg"
                      onClick={() => onEdit(category.id)}
                    >
                      <IconEdit />
                    </Button>
                    <DeleteButton
                      isPending={deleteCategoryMutation.isPending}
                      onDelete={() =>
                        deleteCategoryMutation.mutate(category.id)
                      }
                    />
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
    </>
  )
}
