'use client'

import { useState } from 'react'

import {
  useBlockCustomer,
  useCustomers,
  useUnblockCustomer,
} from '@/actions/hooks/customer'
import { useEmployeePermission } from '@/actions/hooks/employee'
import { StorePagination } from '@/app/sites/[domain]/_components/Pagination'
import { ALL_STORES, useStoreFilter } from '@/stores/use-store-filter'
import { formatDateTime, getBlockMessage } from '@/utils/date'
import { formatNumber } from '@/utils/pricing'
import { IconLock, IconLockOpen } from '@tabler/icons-react'

import { ActionRequiredAlert } from '@/components/ActionRequiredAlert'
import { DeleteButton } from '@/components/DeleteButton'
import { TableEmptyRow } from '@/components/TableEmptyRow'
import { TableLoadingRow } from '@/components/TableLoadingRow'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

export function CustomerTable() {
  const { selectedStoreId } = useStoreFilter()
  const [page, setPage] = useState(1)

  const {
    canViewCustomers,
    canUpdateCustomers,
    isLoading: isPermissionLoading,
  } = useEmployeePermission()

  const unblockMutation = useUnblockCustomer()
  const blockMutation = useBlockCustomer()

  const { data: { data: customers = [], meta } = {}, isLoading } = useCustomers(
    {
      storeId: selectedStoreId,
      page,
      limit: 10,
    },
  )

  if (selectedStoreId === ALL_STORES) {
    return <ActionRequiredAlert />
  }

  if (!isPermissionLoading && !canViewCustomers) {
    return (
      <ActionRequiredAlert
        icon={<IconLock />}
        title="ไม่มีสิทธิ์เข้าถึง"
        description="คุณไม่มีสิทธิ์ในการดูข้อมูลลูกค้าของสาขาหรือร้านค้านี้"
      />
    )
  }

  const showManageColumn = canUpdateCustomers
  const totalColumns = showManageColumn ? 8 : 7

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>รหัสลูกค้า</TableHead>
              <TableHead>ชื่อลูกค้า</TableHead>
              <TableHead>อีเมล</TableHead>
              <TableHead>เบอร์โทร</TableHead>
              <TableHead>สถานะบล็อกสลิป</TableHead>
              <TableHead>กำหนดปลดล็อก</TableHead>
              <TableHead className="text-right">แต้มสะสม</TableHead>
              {showManageColumn && (
                <TableHead className="text-right">จัดการ</TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {(isLoading || isPermissionLoading) && customers.length === 0 ? (
              <TableLoadingRow colSpan={totalColumns} />
            ) : customers.length === 0 ? (
              <TableEmptyRow
                colSpan={totalColumns}
                title="ยังไม่มีข้อมูลลูกค้า"
              />
            ) : (
              customers.map((item) => (
                <TableRow key={item.customer.id}>
                  <TableCell>{item.customer.id}</TableCell>
                  <TableCell>
                    {[item.customer.firstName, item.customer.lastName]
                      .filter(Boolean)
                      .join(' ') || '-'}
                  </TableCell>
                  <TableCell>{item.customer.email}</TableCell>
                  <TableCell>{item.customer.phone ?? '-'}</TableCell>
                  <TableCell className="max-w-72 min-w-72 wrap-break-word whitespace-pre-line">
                    {item.customer.isBlocked ? (
                      <span className="text-destructive">
                        โดนบล็อก ({getBlockMessage(item.customer.blockedUntil)})
                      </span>
                    ) : (
                      '-'
                    )}
                  </TableCell>
                  <TableCell>
                    {item.customer.blockedUntil
                      ? formatDateTime(new Date(item.customer.blockedUntil))
                      : '-'}
                  </TableCell>
                  <TableCell className="text-primary text-right font-semibold">
                    {formatNumber(item.rewardPoints)}
                  </TableCell>
                  {showManageColumn && (
                    <TableCell className="text-right">
                      {item.customer.isBlocked ? (
                        <DeleteButton
                          isPending={unblockMutation.isPending}
                          icon={<IconLockOpen />}
                          title="ยืนยันการปลดล็อกลูกค้า?"
                          description="คุณต้องการปลดล็อกการอัปโหลดสลิปให้กับลูกค้ารายนี้ใช่หรือไม่?"
                          onDelete={() =>
                            unblockMutation.mutate({
                              customerId: item.customer.id,
                              storeId: selectedStoreId,
                            })
                          }
                        />
                      ) : (
                        <DeleteButton
                          isPending={blockMutation.isPending}
                          icon={<IconLock />}
                          title="ยืนยันการบล็อกลูกค้า?"
                          description="คุณต้องการบล็อกการอัปโหลดสลิปของลูกค้ารายนี้ใช่หรือไม่?"
                          onDelete={() =>
                            blockMutation.mutate({
                              customerId: item.customer.id,
                              storeId: selectedStoreId,
                            })
                          }
                        />
                      )}
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
