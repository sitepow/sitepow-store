'use client'

import { useState } from 'react'

import {
  useDeleteStaff,
  useStaffPermission,
  useStaffs,
} from '@/actions/hooks/staff'
import { StorePagination } from '@/app/sites/[domain]/_components/Pagination'
import { STAFF_ROLE_TH } from '@/constants/translate'
import { ALL_STORES, useStoreFilter } from '@/stores/use-store-filter'
import { IconEdit } from '@tabler/icons-react'

import { ActionRequiredAlert } from '@/components/ActionRequiredAlert'
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

interface StaffTableProps {
  onEdit: (id: string) => void
}

export function StaffTable({ onEdit }: StaffTableProps) {
  const { selectedStoreId } = useStoreFilter()
  const [page, setPage] = useState(1)

  const { canManageStoreSettings } = useStaffPermission()
  const deleteStaffMutation = useDeleteStaff()

  const { data: { data: staffs = [], meta } = {}, isLoading } = useStaffs({
    storeId: selectedStoreId,
    page,
    limit: 10,
  })

  if (selectedStoreId === ALL_STORES) {
    return <ActionRequiredAlert />
  }

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>รหัสพนักงาน</TableHead>
              <TableHead>ชื่อพนักงาน</TableHead>
              <TableHead>อีเมล</TableHead>
              <TableHead>บทบาท</TableHead>
              <TableHead>สาขา</TableHead>
              {canManageStoreSettings && (
                <TableHead className="text-right">จัดการ</TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && staffs.length === 0 ? (
              <TableLoadingRow colSpan={canManageStoreSettings ? 6 : 5} />
            ) : staffs.length === 0 ? (
              <TableEmptyRow
                colSpan={canManageStoreSettings ? 6 : 5}
                title="ยังไม่มีพนักงานในร้านนี้"
              />
            ) : (
              staffs.map((staff) => (
                <TableRow key={staff.id}>
                  <TableCell>{staff.id}</TableCell>
                  <TableCell>{staff.staff.name}</TableCell>
                  <TableCell>{staff.staff.email}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{STAFF_ROLE_TH[staff.role]}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {staff.branches.length === 0 ? (
                        <Badge variant="outline">ทุกสาขา</Badge>
                      ) : (
                        staff.branches.map(({ branch }) => (
                          <Badge key={branch.id} variant="outline">
                            {branch.name}
                          </Badge>
                        ))
                      )}
                    </div>
                  </TableCell>
                  {canManageStoreSettings && (
                    <TableCell className="space-x-2 text-right">
                      <Button
                        variant="outline"
                        size="icon-lg"
                        onClick={() => onEdit(staff.id)}
                      >
                        <IconEdit />
                      </Button>
                      <DeleteButton
                        isPending={deleteStaffMutation.isPending}
                        onDelete={() => deleteStaffMutation.mutate(staff.id)}
                      />
                    </TableCell>
                  )}
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
