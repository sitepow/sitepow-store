'use client'

import { useState } from 'react'

import { useCategories, useDeleteCategory } from '@/actions/hooks/category'
import { StorePagination } from '@/app/sites/[domain]/_components/Pagination'
import { useStoreFilter } from '@/stores/use-store-filter'
import { IconEdit } from '@tabler/icons-react'

import { DeleteButton } from '@/components/DeleteButton'
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

export function CategoriesTable() {
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
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>รหัสหมวดหมู่</TableHead>
              <TableHead>ชื่อหมวดหมู่</TableHead>
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
                <TableRow key={category.id}>
                  <TableCell>{category.id}</TableCell>
                  <TableCell>{category.title}</TableCell>
                  <TableCell>
                    <span className="text-muted-foreground text-sm">
                      {category.description || '-'}
                    </span>
                  </TableCell>
                  <TableCell className="space-x-2 text-right">
                    <Button variant="outline" size="icon-lg">
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
