'use client'

/* eslint-disable @next/next/no-img-element */
import { useTranslations } from 'next-intl'

import { useEmployeePermission } from '@/actions/hooks/employee'
import { useDeleteExpense, useExpenses } from '@/actions/hooks/expenses'
import { StorePagination } from '@/app/sites/[domain]/_components/Pagination'
import { EXPENSE_CATEGORY_TH } from '@/constants/translate'
import { useCurrentStore } from '@/hooks/use-current-store'
import { useMerchantCurrency } from '@/hooks/use-merchant-currency'
import { ALL_STORES, useStoreFilter } from '@/stores/use-store-filter'
import { formatDateTime } from '@/utils/date'
import { IconLock, IconSettings } from '@tabler/icons-react'

import { ActionRequiredAlert } from '@/components/ActionRequiredAlert'
import { DeleteButton } from '@/components/DeleteButton'
import { ProductImage } from '@/components/ProductImage'
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
  const { currentStore, store } = useCurrentStore()
  const { formatCurrency } = useMerchantCurrency()
  const t = useTranslations('merchant.expenses')
  const tCategories = useTranslations('merchant.expenses.categories')
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
        title={t('noAccessTitle')}
        description={t('noAccessDescription')}
      />
    )
  }

  return (
    <div
      className="space-y-4"
      style={
        {
          '--primary': currentStore?.primaryColor ?? store?.primaryColor,
        } as React.CSSProperties
      }
    >
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('columns.date')}</TableHead>
              <TableHead>{t('columns.title')}</TableHead>
              <TableHead>{t('columns.category')}</TableHead>
              <TableHead>{t('columns.branch')}</TableHead>
              <TableHead className="text-right">
                {t('columns.amount')}
              </TableHead>
              <TableHead>{t('columns.receipt')}</TableHead>
              {canManageExpenses && (
                <TableHead className="text-right">
                  {t('columns.actions')}
                </TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {(isLoading || isPermissionLoading) && expenses.length === 0 ? (
              <TableLoadingRow colSpan={totalColumns} />
            ) : expenses.length === 0 ? (
              <TableEmptyRow colSpan={totalColumns} title={t('empty')} />
            ) : (
              expenses.map((expense) => (
                <TableRow key={expense.id}>
                  <TableCell>{formatDateTime(expense.expenseDate)}</TableCell>
                  <TableCell className="max-w-72 min-w-72 wrap-break-word whitespace-pre-line">
                    {expense.title}
                  </TableCell>
                  <TableCell>
                    <Badge>
                      {tCategories.has(expense.category as any)
                        ? tCategories(expense.category as any)
                        : EXPENSE_CATEGORY_TH[expense.category] ||
                          expense.category}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={expense?.branch?.name ? 'default' : 'outline'}
                    >
                      {expense?.branch?.name
                        ? expense.branch.name
                        : t('allBranches')}
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
                        <a
                          href={expense.receiptImage}
                          target="_blank"
                          rel="noreferrer"
                        >
                          <ProductImage
                            src={expense.receiptImage}
                            alt={expense.title}
                          />
                          <span className="text-primary text-xs">
                            {t('viewReceiptImage')}
                          </span>
                        </a>
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
                          title={t('deleteConfirmTitle')}
                          description={t('deleteConfirmDescription')}
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
    </div>
  )
}
