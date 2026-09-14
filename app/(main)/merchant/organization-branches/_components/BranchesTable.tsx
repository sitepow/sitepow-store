'use client'

import { useCurrentStore } from '@/hooks/use-current-store'

import { useState } from 'react'

import { useTranslations } from 'next-intl'

import { useBranches, useDeleteBranch } from '@/actions/hooks/branch'
import { StorePagination } from '@/components/StorePagination'
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
  const { currentStore, store } = useCurrentStore()
  const t = useTranslations('merchant.branches')
  const { selectedStoreId } = useStoreFilter()
  const [page, setPage] = useState(1)

  const { data: { data: branches = [], meta } = {}, isLoading } = useBranches({
    storeId: selectedStoreId,
    page,
    limit: 10,
  })

  const deleteBranchMutation = useDeleteBranch()

  return (
    <div
      className="space-y-4"
      style={{
        '--primary': currentStore?.primaryColor ?? store?.primaryColor,
      } as React.CSSProperties}
    >
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('columns.code')}</TableHead>
              <TableHead>{t('columns.name')}</TableHead>
              <TableHead>{t('columns.type')}</TableHead>
              <TableHead className="text-right">
                {t('columns.actions')}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && branches.length === 0 ? (
              <TableLoadingRow colSpan={4} />
            ) : branches.length === 0 ? (
              <TableEmptyRow colSpan={4} title={t('empty')} />
            ) : (
              branches.map((branch) => (
                <TableRow key={branch.id}>
                  <TableCell>{branch.id}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{branch.name}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={branch.isMain ? 'default' : 'outline'}>
                      {branch.isMain ? t('mainBranch') : t('subBranch')}
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
    </div>
  )
}
