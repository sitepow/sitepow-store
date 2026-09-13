'use client'

import React, { useState } from 'react'

import { useTranslations } from 'next-intl'

import {
  useBlockCustomer,
  useCustomers,
  useUnblockCustomer,
} from '@/actions/hooks/customer'
import { useEmployeePermission } from '@/actions/hooks/employee'
import { StorePagination } from '@/app/sites/[domain]/_components/Pagination'
import { useCurrentStore } from '@/hooks/use-current-store'
import { useMerchantCurrency } from '@/hooks/use-merchant-currency'
import { ALL_STORES, useStoreFilter } from '@/stores/use-store-filter'
import { formatDateTime, getBlockMessage } from '@/utils/date'
import { formatNumber } from '@/utils/pricing'
import { formatPromptPay } from '@/utils/slip'
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
  const { currentStore, store } = useCurrentStore()
  const { formatCurrency } = useMerchantCurrency()
  const t = useTranslations('merchant.customers')
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
        title={t('noAccessTitle')}
        description={t('noAccessDescription')}
      />
    )
  }

  const showManageColumn = canUpdateCustomers
  const totalColumns = showManageColumn ? 9 : 8

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
              <TableHead>{t('columns.customerId')}</TableHead>
              <TableHead>{t('columns.name')}</TableHead>
              <TableHead>{t('columns.email')}</TableHead>
              <TableHead>{t('columns.phone')}</TableHead>
              <TableHead>{t('columns.blockStatus')}</TableHead>
              <TableHead>{t('columns.unblockDate')}</TableHead>
              <TableHead className="text-right">
                {t('columns.points')}
              </TableHead>
              <TableHead className="text-right">
                {t('columns.totalSpent')}
              </TableHead>
              {showManageColumn && (
                <TableHead className="text-right">
                  {t('columns.actions')}
                </TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {(isLoading || isPermissionLoading) && customers.length === 0 ? (
              <TableLoadingRow colSpan={totalColumns} />
            ) : customers.length === 0 ? (
              <TableEmptyRow colSpan={totalColumns} title={t('empty')} />
            ) : (
              customers.map((item) => (
                <TableRow key={item.customer.id}>
                  <TableCell>{item.customer.id}</TableCell>
                  <TableCell className="max-w-48 min-w-48 wrap-break-word whitespace-pre-line">
                    {[item.customer.firstName, item.customer.lastName]
                      .filter(Boolean)
                      .join(' ') || '-'}
                  </TableCell>
                  <TableCell className="max-w-48 min-w-48 wrap-break-word whitespace-pre-line">
                    {item.customer.email}
                  </TableCell>
                  <TableCell>
                    {item.customer.phone
                      ? formatPromptPay(item.customer.phone)
                      : '-'}
                  </TableCell>
                  <TableCell className="max-w-72 min-w-72 wrap-break-word whitespace-pre-line">
                    {item.isBlocked ? (
                      <span className="text-destructive">
                        {t('blockedReason', {
                          reason: getBlockMessage(item.blockedUntil),
                        })}
                      </span>
                    ) : (
                      '-'
                    )}
                  </TableCell>
                  <TableCell>
                    {item.blockedUntil
                      ? formatDateTime(new Date(item.blockedUntil))
                      : '-'}
                  </TableCell>
                  <TableCell className="text-right">
                    {formatNumber(item.rewardPoints)}
                  </TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(item.totalSpent)}
                  </TableCell>
                  {showManageColumn && (
                    <TableCell className="text-right">
                      {item.isBlocked ? (
                        <DeleteButton
                          isPending={unblockMutation.isPending}
                          icon={<IconLockOpen />}
                          title={t('unblockConfirmTitle')}
                          description={t('unblockConfirmDescription')}
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
                          title={t('blockConfirmTitle')}
                          description={t('blockConfirmDescription')}
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
    </div>
  )
}
