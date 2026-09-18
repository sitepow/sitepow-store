'use client'

import { useTranslations } from 'next-intl'
import { IconEye } from '@tabler/icons-react'

import { GetActivityLogItem } from '@/actions/activity-log'
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
import { formatDateTime } from '@/utils/date'

import { ActionBadge } from './ActionBadge'
import { ActorBadge } from './ActorBadge'

interface AuditLogTableProps {
  logs: GetActivityLogItem[]
  isLoading: boolean
  onOpenDetails: (log: GetActivityLogItem) => void
}

export function AuditLogTable({
  logs,
  isLoading,
  onOpenDetails,
}: AuditLogTableProps) {
  const t = useTranslations('merchant.auditLogs')

  return (
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
          {isLoading && logs.length === 0 ? (
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
                    onClick={() => onOpenDetails(log)}
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
  )
}

