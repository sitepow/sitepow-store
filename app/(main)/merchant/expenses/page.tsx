'use client'

import { useState } from 'react'

import { useTranslations } from 'next-intl'

import { useEmployeePermission } from '@/actions/hooks/employee'
import { MERCHANT_NAVIGATION } from '@/constants/navigation'
import { ALL_STORES, useStoreFilter } from '@/stores/use-store-filter'
import { IconLock, IconPlus, IconReceipt } from '@tabler/icons-react'

import { ActionRequiredAlert } from '@/components/ActionRequiredAlert'
import { BranchSelectField } from '@/components/BranchSelectField'
import { ExpenseCategorySelectField } from '@/components/ExpenseCategorySelectField'
import { PageTabHeader } from '@/components/PageTabHeader'
import { StoreSelectField } from '@/components/StoreSelectField'
import { Sidebar } from '@/components/layout/Sidebar'
import { Button } from '@/components/ui/button'

import { ExpenseDialog } from './_components/ExpenseDialog'
import { ExpenseTable } from './_components/ExpenseTable'

export default function ExpensesPage() {
  const t = useTranslations('merchant.expenses')
  const { selectedStoreId } = useStoreFilter()
  const {
    canViewExpenses,
    canCreateExpenses,
    isLoading: isPermissionLoading,
  } = useEmployeePermission()

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingExpenseId, setEditingExpenseId] = useState<string | undefined>()

  const [page, setPage] = useState(1)
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL')

  const handleOpenCreate = () => {
    setEditingExpenseId(undefined)
    setDialogOpen(true)
  }

  const handleOpenEdit = (id: string) => {
    setEditingExpenseId(id)
    setDialogOpen(true)
  }

  return (
    <Sidebar redirectPath="merchant" items={MERCHANT_NAVIGATION}>
      <PageTabHeader
        icon={IconReceipt}
        title={t('title')}
        description={t('description')}
        endContent={
          <div className="flex flex-wrap items-end gap-2.5">
            <StoreSelectField />
            <BranchSelectField />
            <ExpenseCategorySelectField
              value={selectedCategory}
              onValueChange={(val) => {
                setSelectedCategory(val)
                setPage(1)
              }}
            />
            {canCreateExpenses && (
              <Button onClick={handleOpenCreate}>
                <IconPlus className="size-4" />
                {t('addExpense')}
              </Button>
            )}
          </div>
        }
      />
      {selectedStoreId !== ALL_STORES &&
      !isPermissionLoading &&
      !canViewExpenses ? (
        <ActionRequiredAlert
          icon={<IconLock />}
          title={t('noAccessTitle')}
          description={t('noAccessDescription')}
        />
      ) : (
        <div className="space-y-4">
          <ExpenseTable
            page={page}
            setPage={setPage}
            selectedCategory={selectedCategory}
            onEdit={handleOpenEdit}
          />
          <ExpenseDialog
            expenseId={editingExpenseId}
            open={dialogOpen}
            setOpen={setDialogOpen}
          />
        </div>
      )}
    </Sidebar>
  )
}
