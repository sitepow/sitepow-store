'use client'

import { useState } from 'react'

import {
  useDeleteEmployee,
  useEmployeePermission,
  useEmployees,
} from '@/actions/hooks/employee'
import { StorePagination } from '@/app/sites/[domain]/_components/Pagination'
import { ALL_STORES, useStoreFilter } from '@/stores/use-store-filter'
import { extractEmployeeStoreData } from '@/utils/employee'
import { IconKey, IconLock, IconSettings } from '@tabler/icons-react'

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

  const {
    canViewEmployee,
    canUpdateEmployee,
    canDeleteEmployee,
    isLoading: isPermissionLoading,
  } = useEmployeePermission()

  const canManageEmployee = canUpdateEmployee || canDeleteEmployee

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

  if (!isPermissionLoading && !canViewEmployee) {
    return (
      <ActionRequiredAlert
        icon={<IconLock />}
        title="ไม่มีสิทธิ์เข้าถึง"
        description="คุณไม่มีสิทธิ์ในการดูข้อมูลพนักงานของสาขาหรือร้านค้านี้"
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
              employees.map((employeeStore) => {
                const {
                  roleNames,
                  uniquePermissions,
                  displayedRoles,
                  remainingRolesCount,
                  displayedPermissions,
                  remainingPermissionsCount,
                } = extractEmployeeStoreData(employeeStore.branches)

                return (
                  <TableRow key={employeeStore.id}>
                    <TableCell>{employeeStore.id}</TableCell>
                    <TableCell>{employeeStore.employee?.name}</TableCell>
                    <TableCell>{employeeStore.employee?.email}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap items-center gap-1">
                        {roleNames.length === 0 ? (
                          <Badge variant="outline">ไม่ระบุบทบาท</Badge>
                        ) : (
                          <>
                            {displayedRoles.map((roleName, idx) => (
                              <Badge key={idx} variant="outline">
                                {roleName}
                              </Badge>
                            ))}
                            {remainingRolesCount > 0 && (
                              <span className="text-muted-foreground text-xs">
                                +{remainingRolesCount}
                              </span>
                            )}
                          </>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex max-w-72 min-w-72 flex-wrap items-center gap-1">
                        {uniquePermissions.length === 0 ? (
                          <span className="text-muted-foreground text-xs">
                            ไม่มีสิทธิ์
                          </span>
                        ) : (
                          <>
                            {displayedPermissions.map((permission) => (
                              <Badge
                                key={permission.id}
                                variant="outline"
                                className="text-xs"
                              >
                                <IconKey className="size-4" />
                                {permission.domain}_{permission.action}
                              </Badge>
                            ))}
                            {remainingPermissionsCount > 0 && (
                              <span className="text-muted-foreground text-xs">
                                +{remainingPermissionsCount}
                              </span>
                            )}
                          </>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {employeeStore.branches.length === 0 ? (
                          <Badge variant="outline">ทุกสาขา</Badge>
                        ) : (
                          employeeStore.branches.map(({ branch }) => (
                            <Badge key={branch.id} variant="outline">
                              {branch.name}
                            </Badge>
                          ))
                        )}
                      </div>
                    </TableCell>
                    {canManageEmployee && (
                      <TableCell className="space-x-2 text-right">
                        {canUpdateEmployee && (
                          <Button
                            variant="outline"
                            size="icon-lg"
                            onClick={() => onEdit(employeeStore.id)}
                          >
                            <IconSettings />
                          </Button>
                        )}
                        {canDeleteEmployee && (
                          <DeleteButton
                            isPending={deleteEmployeeMutation.isPending}
                            onDelete={() =>
                              deleteEmployeeMutation.mutate(employeeStore.id)
                            }
                          />
                        )}
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
