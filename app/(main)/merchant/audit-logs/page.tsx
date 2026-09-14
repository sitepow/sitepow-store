'use client'

import { useState } from 'react'

import { useTranslations } from 'next-intl'

import { GetActivityLogItem } from '@/actions/activity-log'
import { useActivityLogs } from '@/actions/hooks/activity-log'
import { useEmployeePermission } from '@/actions/hooks/employee'
import { MERCHANT_NAVIGATION } from '@/constants/navigation'
import { ActorType, LogAction } from '@/generated/prisma/enums'
import { ALL_STORES, useStoreFilter } from '@/stores/use-store-filter'
import { formatDateTime } from '@/utils/date'
import { IconEye, IconHistory, IconLock } from '@tabler/icons-react'

import { ActionRequiredAlert } from '@/components/ActionRequiredAlert'
import { PageTabHeader } from '@/components/PageTabHeader'
import { StorePagination } from '@/components/StorePagination'
import { StoreSelectField } from '@/components/StoreSelectField'
import { TableEmptyRow } from '@/components/TableEmptyRow'
import { TableLoadingRow } from '@/components/TableLoadingRow'
import { Sidebar } from '@/components/layout/Sidebar'
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

import { ActionBadge } from './_components/ActionBadge'
import { ActorBadge } from './_components/ActorBadge'
import { AuditLogDetailDialog } from './_components/AuditLogDetailDialog'
import { AuditLogFilters } from './_components/AuditLogFilters'

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
          <div className="overflow-hidden rounded-xl border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('columns.timestamp')}</TableHead>
                  <TableHead>{t('columns.action')}</TableHead>
                  <TableHead>{t('columns.actorGroup')}</TableHead>
                  <TableHead>{t('columns.actor')}</TableHead>
                  <TableHead>{t('columns.targetEntity')}</TableHead>
                  <TableHead>{t('columns.ipAddress')}</TableHead>
                  <TableHead>{t('columns.view')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(isLoading || isPermissionLoading) && logs.length === 0 ? (
                  <TableLoadingRow colSpan={7} />
                ) : logs.length === 0 ? (
                  <TableEmptyRow
                    title={t('empty')}
                    description={t('emptyDesc')}
                    colSpan={7}
                  />
                ) : (
                  logs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell>{formatDateTime(log.createdAt)}</TableCell>
                      <TableCell>
                        <ActionBadge action={log.action} />
                      </TableCell>
                      <TableCell>
                        <ActorBadge actorType={log.actorType} />
                      </TableCell>
                      <TableCell>
                        {log.employee?.name ?? log.user?.name ?? '-'}
                      </TableCell>
                      <TableCell className="space-x-2">
                        <span>{log.entity}</span>
                        {log.entityId && (
                          <Badge variant="outline">{log.entityId}</Badge>
                        )}
                      </TableCell>
                      <TableCell>{log.ipAddress ?? '-'}</TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleOpenDetails(log)}
                        >
                          <IconEye />
                        </Button>
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
