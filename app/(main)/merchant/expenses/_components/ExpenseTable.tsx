/* eslint-disable @next/next/no-img-element */
'use client'

import { useEmployeePermission } from '@/actions/hooks/employee'
import { useDeleteExpense, useExpenses } from '@/actions/hooks/expenses'
import { StorePagination } from '@/app/sites/[domain]/_components/Pagination'
import { EXPENSE_CATEGORY_TH } from '@/constants/translate'
import { ALL_STORES, useStoreFilter } from '@/stores/use-store-filter'
import { formatDateTime } from '@/utils/date'
import { formatCurrency } from '@/utils/pricing'
import { IconLock, IconSettings } from '@tabler/icons-react'

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

interface ExpenseTableProps {
  page: number
  setPage: (page: number) => void
  selectedCategory: string
  onEdit: (id: string) => void
}

export function ExpenseTable({
  page,
  setPage,
  selectedCategory,
  onEdit,
}: ExpenseTableProps) {
  const { selectedStoreId } = useStoreFilter()

  const {
    canViewExpenses,
    canUpdateExpenses,
    canDeleteExpenses,
    isLoading: isPermissionLoading,
  } = useEmployeePermission()

  const canManageExpenses = canUpdateExpenses || canDeleteExpenses
  const deleteExpenseMutation = useDeleteExpense()

  const { data: { data: expenses = [], meta } = {}, isLoading } = useExpenses({
    storeId: selectedStoreId,
    page,
    limit: 10,
    category: selectedCategory !== 'ALL' ? selectedCategory : undefined,
  })

  const totalColumns = canManageExpenses ? 7 : 6

  if (selectedStoreId === ALL_STORES) {
    return <ActionRequiredAlert />
  }

  if (!isPermissionLoading && !canViewExpenses) {
    return (
      <ActionRequiredAlert
        icon={<IconLock />}
        title="ไม่มีสิทธิ์เข้าถึง"
        description="คุณไม่มีสิทธิ์ในการดูข้อมูลค่าใช้จ่ายของสาขาหรือร้านค้านี้"
      />
    )
  }

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>วันที่บันทึก</TableHead>
              <TableHead>รายการ</TableHead>
              <TableHead>หมวดหมู่</TableHead>
              <TableHead>สาขา</TableHead>
              <TableHead className="text-right">จำนวนเงิน</TableHead>
              <TableHead>หลักฐาน / หมายเหตุ</TableHead>
              {canManageExpenses && (
                <TableHead className="text-right">จัดการ</TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {(isLoading || isPermissionLoading) && expenses.length === 0 ? (
              <TableLoadingRow colSpan={totalColumns} />
            ) : expenses.length === 0 ? (
              <TableEmptyRow
                colSpan={totalColumns}
                title="ยังไม่มีรายการค่าใช้จ่าย"
              />
            ) : (
              expenses.map((expense) => (
                <TableRow key={expense.id}>
                  <TableCell>{formatDateTime(expense.expenseDate)}</TableCell>
                  <TableCell className="max-w-72 min-w-72 wrap-break-word whitespace-pre-line">
                    {expense.title}
                  </TableCell>
                  <TableCell>
                    <Badge>
                      {EXPENSE_CATEGORY_TH[expense.category] ||
                        expense.category}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={expense?.branch?.name ? 'default' : 'outline'}
                    >
                      {expense?.branch?.name ? expense.branch.name : 'ทุกสาขา'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    -{formatCurrency(expense.amount)}
                  </TableCell>
                  <TableCell className="max-w-72 min-w-72 wrap-break-word whitespace-pre-line">
                    <div>
                      {expense.note && (
                        <p className="text-sm">{expense.note}</p>
                      )}
                      {expense.receiptImage ? (
                        <div className="mt-1 flex gap-1">
                          <a
                            href={expense.receiptImage}
                            target="_blank"
                            rel="noreferrer"
                            className="border-primary border border-dashed p-1"
                            title="คลิกเพื่อดูรูปขนาดเต็ม"
                          >
                            <img
                              src={expense.receiptImage}
                              alt={expense.title}
                              className="size-14 object-cover"
                            />
                          </a>
                        </div>
                      ) : (
                        !expense.note && (
                          <span className="text-muted-foreground text-xs">
                            -
                          </span>
                        )
                      )}
                    </div>
                  </TableCell>
                  {canManageExpenses && (
                    <TableCell className="space-x-2 text-right">
                      {canUpdateExpenses && (
                        <Button
                          variant="outline"
                          size="icon-lg"
                          onClick={() => onEdit(expense.id)}
                        >
                          <IconSettings />
                        </Button>
                      )}
                      {canDeleteExpenses && (
                        <DeleteButton
                          isPending={deleteExpenseMutation.isPending}
                          title="ยืนยันการลบค่าใช้จ่าย?"
                          description="คุณต้องการลบรายการค่าใช้จ่ายนี้ใช่หรือไม่? การกระทำนี้ไม่สามารถย้อนกลับได้"
                          onDelete={() =>
                            deleteExpenseMutation.mutate({
                              expenseId: expense.id,
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
