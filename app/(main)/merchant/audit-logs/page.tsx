'use client'

import { useState } from 'react'

import { useTranslations } from 'next-intl'

import { GetActivityLogItem } from '@/actions/activity-log'
import { useActivityLogs } from '@/actions/hooks/activity-log'
import { useEmployeePermission } from '@/actions/hooks/employee'
import { MERCHANT_NAVIGATION } from '@/constants/navigation'
import { ActorType, LogAction } from '@/generated/prisma/enums'
import { ALL_STORES, useStoreFilter } from '@/stores/use-store-filter'
import { IconHistory, IconLock } from '@tabler/icons-react'

import { ActionRequiredAlert } from '@/components/ActionRequiredAlert'
import { PageTabHeader } from '@/components/PageTabHeader'
import { StorePagination } from '@/components/StorePagination'
import { StoreSelectField } from '@/components/StoreSelectField'
import { Sidebar } from '@/components/layout/Sidebar'

import { AuditLogDetailDialog } from './_components/AuditLogDetailDialog'
import { AuditLogFilters } from './_components/AuditLogFilters'
import { AuditLogTable } from './_components/AuditLogTable'

export default function MerchantAuditLogsPage() {
  const t = useTranslations('merchant.auditLogs')
  const { selectedStoreId } = useStoreFilter()
  const [actionFilter, setActionFilter] = useState<string>('all')
  const [actorFilter, setActorFilter] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [page, setPage] = useState(1)

  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [activeLogItem, setActiveLogItem] = useState<GetActivityLogItem | null>(
    null,
  )

  const { canViewActivityLogs, isLoading: isPermissionLoading } =
    useEmployeePermission()

  const { data: { data: logs = [], meta } = {}, isLoading } = useActivityLogs({
    storeId: selectedStoreId === ALL_STORES ? '' : selectedStoreId,
    action:
      actionFilter !== ALL_STORES ? (actionFilter as LogAction) : undefined,
    actorType:
      actorFilter !== ALL_STORES ? (actorFilter as ActorType) : undefined,
    search: searchQuery || undefined,
    page,
    limit: 10,
  })

  const handleOpenDetails = (log: GetActivityLogItem) => {
    setActiveLogItem(log)
    setIsDialogOpen(true)
  }

  return (
    <Sidebar redirectPath="merchant" items={MERCHANT_NAVIGATION}>
      <PageTabHeader
        icon={IconHistory}
        title={t('title')}
        description={t('description')}
        endContent={<StoreSelectField />}
      />

      {selectedStoreId === ALL_STORES ? (
        <ActionRequiredAlert />
      ) : !isPermissionLoading && !canViewActivityLogs ? (
        <ActionRequiredAlert
          icon={<IconLock />}
          title={t('noAccessTitle')}
          description={t('noAccessDescription')}
        />
      ) : (
        <>
          <AuditLogFilters
            searchQuery={searchQuery}
            onSearchQueryChange={(v) => {
              setSearchQuery(v)
              setPage(1)
            }}
            actorFilter={actorFilter}
            onActorFilterChange={(v) => {
              setActorFilter(v)
              setPage(1)
            }}
            actionFilter={actionFilter}
            onActionFilterChange={(v) => {
              setActionFilter(v)
              setPage(1)
            }}
          />

          <AuditLogTable
            logs={logs}
            isLoading={isLoading || isPermissionLoading}
            onOpenDetails={handleOpenDetails}
          />

          {meta && meta.totalPages > 1 && (
            <StorePagination
              currentPage={meta.currentPage}
              totalPages={meta.totalPages}
              hasNextPage={meta.hasNextPage}
              hasPreviousPage={meta.hasPreviousPage}
              onPageChange={(newPage) => setPage(newPage)}
            />
          )}

          <AuditLogDetailDialog
            isOpen={isDialogOpen}
            onOpenChange={setIsDialogOpen}
            logItem={activeLogItem}
          />
        </>
      )}
    </Sidebar>
  )
}
