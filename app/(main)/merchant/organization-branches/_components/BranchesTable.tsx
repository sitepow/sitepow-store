'use client'

import { useState } from 'react'

import { useBranches, useDeleteBranch } from '@/actions/store/branch/hooks'
import { StorePagination } from '@/app/sites/[domain]/_components/Pagination'
import { useStoreFilter } from '@/stores/use-store-filter'
import { IconEdit } from '@tabler/icons-react'

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

interface BranchesTableProps {
  onEdit: (id: string) => void
}

export function BranchesTable({ onEdit }: BranchesTableProps) {
  const { selectedStoreId } = useStoreFilter()
  const [page, setPage] = useState(1)

  const { data: { data: branches = [], meta } = {}, isLoading } = useBranches({
    storeId: selectedStoreId,
    page,
    limit: 10,
  })

  const deleteBranchMutation = useDeleteBranch()

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>รหัสสาขา</TableHead>
              <TableHead>ชื่อสาขา</TableHead>
              <TableHead>ประเภท</TableHead>
              <TableHead className="text-right">จัดการ</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && branches.length === 0 ? (
              <TableLoadingRow colSpan={4} />
            ) : branches.length === 0 ? (
              <TableEmptyRow colSpan={4} title="ไม่พบรายการสาขา" />
            ) : (
              branches.map((branch) => (
                <TableRow key={branch.id}>
                  <TableCell>{branch.id}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{branch.name}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={branch.isMain ? 'default' : 'outline'}>
                      {branch.isMain ? 'สาขาหลัก' : 'สาขาย่อย'}
                    </Badge>
                  </TableCell>
                  <TableCell className="space-x-2 text-right">
                    <Button
                      variant="outline"
                      size="icon-lg"
                      onClick={() => onEdit(branch.id)}
                    >
                      <IconEdit />
                    </Button>
                    <DeleteButton
                      isPending={deleteBranchMutation.isPending}
                      onDelete={() =>
                        deleteBranchMutation.mutate({
                          id: branch.id,
                          storeId: selectedStoreId,
                        })
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
