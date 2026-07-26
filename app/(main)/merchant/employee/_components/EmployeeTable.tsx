'use client'

import { useState } from 'react'

import {
  useDeleteEmployee,
  useEmployeePermission,
  useEmployees,
} from '@/actions/hooks/employee'
import { StorePagination } from '@/app/sites/[domain]/_components/Pagination'
import { ALL_STORES, useStoreFilter } from '@/stores/use-store-filter'
import { IconSettings } from '@tabler/icons-react'

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

interface EmployeeTableProps {
  onEdit: (id: string) => void
}

export function EmployeeTable({ onEdit }: EmployeeTableProps) {
  const { selectedStoreId } = useStoreFilter()
  const [page, setPage] = useState(1)

  const { canManageEmployee, isLoading: isPermissionLoading } =
    useEmployeePermission()

  const deleteEmployeeMutation = useDeleteEmployee()

  const { data: { data: employees = [], meta } = {}, isLoading } = useEmployees(
    {
      storeId: selectedStoreId,
      page,
      limit: 10,
    },
  )

  const totalColumns = canManageEmployee ? 7 : 6

  if (selectedStoreId === ALL_STORES) {
    return <ActionRequiredAlert />
  }

  if (!isPermissionLoading && !canManageEmployee) {
    return (
      <ActionRequiredAlert
        title="ไม่มีสิทธิ์เข้าถึง"
        description="คุณไม่มีสิทธิ์ในการจัดการข้อมูลพนักงานของสาขาหรือร้านค้านี้"
      />
    )
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
              <TableHead>สิทธิ์การใช้งาน</TableHead>
              <TableHead>สาขา</TableHead>
              {canManageEmployee && (
                <TableHead className="text-right">จัดการ</TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {(isLoading || isPermissionLoading) && employees.length === 0 ? (
              <TableLoadingRow colSpan={totalColumns} />
            ) : employees.length === 0 ? (
              <TableEmptyRow
                colSpan={totalColumns}
                title="ยังไม่มีพนักงานในร้านนี้"
              />
            ) : (
              employees.map((employee) => {
                const permissions = employee.role?.permissions ?? []

                return (
                  <TableRow key={employee.id}>
                    <TableCell>{employee.id}</TableCell>
                    <TableCell>{employee.employee?.name}</TableCell>
                    <TableCell>{employee.employee?.email}</TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {employee.role?.name ?? 'ไม่ระบุบทบาท'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="maw-w-72 flex max-w-xs min-w-72 flex-wrap gap-1 wrap-break-word whitespace-pre-line">
                        {permissions.length === 0 ? (
                          <span className="text-muted-foreground text-xs">
                            ไม่มีสิทธิ์
                          </span>
                        ) : (
                          permissions.map(({ permission }) => (
                            <Badge
                              key={permission.id}
                              variant="secondary"
                              className="text-xs"
                            >
                              {permission.domain}_{permission.action}
                            </Badge>
                          ))
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {employee.branches.length === 0 ? (
                          <Badge variant="outline">ทุกสาขา</Badge>
                        ) : (
                          employee.branches.map(({ branch }) => (
                            <Badge key={branch.id} variant="outline">
                              {branch.name}
                            </Badge>
                          ))
                        )}
                      </div>
                    </TableCell>
                    {canManageEmployee && (
                      <TableCell className="space-x-2 text-right">
                        <Button
                          variant="outline"
                          size="icon-lg"
                          onClick={() => onEdit(employee.id)}
                        >
                          <IconSettings />
                        </Button>
                        <DeleteButton
                          isPending={deleteEmployeeMutation.isPending}
                          onDelete={() =>
                            deleteEmployeeMutation.mutate(employee.id)
                          }
                        />
                      </TableCell>
                    )}
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
