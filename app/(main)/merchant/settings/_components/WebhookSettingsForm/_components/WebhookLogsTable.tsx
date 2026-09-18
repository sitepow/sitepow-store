'use client'

import { useTranslations } from 'next-intl'
import { IconAlertCircle, IconRefresh, IconSend } from '@tabler/icons-react'

import { StoreWebhookEndpointItem } from '@/actions/webhook'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Spinner } from '@/components/ui/spinner'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

import { WebhookLogItem } from './WebhookLogDetailDialog'

interface WebhookLogsTableProps {
  endpoints: StoreWebhookEndpointItem[]
  activeEndpointId?: string
  logs: WebhookLogItem[]
  isLoadingLogs: boolean
  isTesting: boolean
  resendingLogId: string | null
  onTestPing: (id: string) => void
  onViewLog: (log: WebhookLogItem) => void
  onResendLog: (logId: string) => void
  getEventLabel: (eventId: string) => string
}

export function WebhookLogsTable({
  endpoints,
  activeEndpointId,
  logs,
  isLoadingLogs,
  isTesting,
  resendingLogId,
  onTestPing,
  onViewLog,
  onResendLog,
  getEventLabel,
}: WebhookLogsTableProps) {
  const t = useTranslations('merchant.settings.webhook')

  if (endpoints.length === 0) {
    return null
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <div>
          <CardTitle className="text-base">{t('logsTitle')}</CardTitle>
          <CardDescription className="text-xs">
            {activeEndpointId ? (
              <>
                {t('logsDescPrefix')}{' '}
                <span className="text-foreground font-medium">
                  {endpoints.find((e) => e.id === activeEndpointId)?.url}
                </span>
              </>
            ) : (
              t('logsDescSelect')
            )}
          </CardDescription>
        </div>
        {activeEndpointId && (
          <Button
            variant="outline"
            size="sm"
            className="h-8 gap-1 text-xs"
            onClick={() => onTestPing(activeEndpointId)}
            disabled={isTesting}
          >
            <IconSend size={13} />
            <span>{t('logsTestPing')}</span>
          </Button>
        )}
      </CardHeader>
      <CardContent>
        {isLoadingLogs ? (
          <div className="flex h-24 items-center justify-center">
            <Spinner className="h-5 w-5" />
          </div>
        ) : logs.length === 0 ? (
          <div className="text-muted-foreground flex h-24 flex-col items-center justify-center rounded-lg border border-dashed text-center text-sm">
            <IconAlertCircle className="mb-1 h-5 w-5" />
            {t('logsEmpty')}
          </div>
        ) : (
          <div className="overflow-x-auto rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('logStatusCol')}</TableHead>
                  <TableHead>{t('logEventCol')}</TableHead>
                  <TableHead>{t('logDurationCol')}</TableHead>
                  <TableHead>{t('logDateCol')}</TableHead>
                  <TableHead className="text-right">
                    {t('logActionsCol')}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell>
                      <Badge
                        variant={log.isSuccess ? 'default' : 'destructive'}
                        className="text-xs"
                      >
                        {log.isSuccess ? 'Success' : 'Failed'}
                        {log.statusCode ? ` (${log.statusCode})` : ''}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="text-xs">
                        {getEventLabel(log.event)}
                      </span>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-xs">
                      {log.executionTimeMs}ms
                    </TableCell>
                    <TableCell className="text-muted-foreground text-xs">
                      {new Date(log.createdAt).toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-7 text-xs"
                          onClick={() => onViewLog(log)}
                        >
                          {t('viewPayload')}
                        </Button>
                        <Button
                          variant={log.isSuccess ? 'ghost' : 'default'}
                          size="sm"
                          className="h-7 gap-1 px-2 text-xs"
                          onClick={() => onResendLog(log.id)}
                          disabled={resendingLogId === log.id}
                          title={t('resend')}
                        >
                          {resendingLogId === log.id ? (
                            <Spinner className="size-3" />
                          ) : (
                            <IconRefresh size={13} />
                          )}
                          <span>
                            {resendingLogId === log.id
                              ? t('resending')
                              : t('resend')}
                          </span>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
