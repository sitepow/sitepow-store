'use client'

import { useLocale, useTranslations } from 'next-intl'

import { getWebhookEvents } from '@/constants/webhook'
import { useCopyToClipboard } from '@/hooks/use-copy-to-clipboard'
import { IconCheck, IconCopy, IconRefresh } from '@tabler/icons-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Spinner } from '@/components/ui/spinner'

export interface WebhookLogItem {
  id: string
  event: string
  statusCode: number | null
  requestPayload: any
  responseBody: string | null
  executionTimeMs: number
  isSuccess: boolean
  errorMessage: string | null
  createdAt: Date | string
}

interface WebhookLogDetailDialogProps {
  open: boolean
  setOpen: (open: boolean) => void
  log: WebhookLogItem | null
  onResend?: (logId: string) => void
  isResending?: boolean
}

export function WebhookLogDetailDialog({
  open,
  setOpen,
  log,
  onResend,
  isResending,
}: WebhookLogDetailDialogProps) {
  const t = useTranslations('merchant.settings.webhook.logDetail')
  const tEvents = useTranslations('merchant.settings.webhook.events')
  const locale = useLocale()
  const fallbackEvents = getWebhookEvents(locale)

  const getEventLabel = (eventId: string) => {
    const camelKey = eventId.replace(/\.([a-z])/g, (_, l) => l.toUpperCase())
    if (tEvents.has(`${eventId}.label` as any)) {
      return tEvents(`${eventId}.label` as any)
    }
    if (tEvents.has(`${camelKey}.label` as any)) {
      return tEvents(`${camelKey}.label` as any)
    }
    const fallback = fallbackEvents.find((e) => e.id === eventId)
    return fallback?.label || eventId
  }

  const { copied, copy } = useCopyToClipboard()

  if (!log) {
    return null
  }

  const payloadString = JSON.stringify(log.requestPayload, null, 2)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-h-[85vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <DialogTitle>{t('title')}</DialogTitle>
            <Badge variant={log.isSuccess ? 'default' : 'destructive'}>
              {log.isSuccess ? 'Success' : 'Failed'}
              {log.statusCode ? ` (${log.statusCode})` : ''}
            </Badge>
          </div>
          <DialogDescription>
            {t('event')}:{' '}
            <span className="font-medium">{getEventLabel(log.event)}</span> •{' '}
            {t('duration')}: {log.executionTimeMs}ms • {t('date')}:{' '}
            {new Date(log.createdAt).toLocaleString()}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          {log.errorMessage && (
            <div className="border-destructive/20 bg-destructive/10 text-destructive rounded-lg border p-3 text-sm">
              <span className="font-semibold">{t('error')}</span>
              {log.errorMessage}
            </div>
          )}
          <div>
            <div className="flex items-center justify-between pb-1.5">
              <span className="text-sm font-semibold">
                {t('requestPayload')}
              </span>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 gap-1 px-2 text-xs"
                onClick={() => copy(payloadString)}
              >
                {copied ? (
                  <>
                    <IconCheck size={14} className="text-emerald-500" />
                    <span>{t('copied')}</span>
                  </>
                ) : (
                  <>
                    <IconCopy size={14} />
                    <span>{t('copyJson')}</span>
                  </>
                )}
              </Button>
            </div>
            <pre className="bg-muted/60 max-h-64 overflow-auto rounded-lg border p-3 text-xs leading-relaxed">
              {payloadString}
            </pre>
          </div>
          <div>
            <span className="text-sm font-semibold">{t('responseBody')}</span>
            <pre className="bg-muted/60 mt-1.5 max-h-40 overflow-auto rounded-lg border p-3 text-xs leading-relaxed">
              {log.responseBody || t('noResponse')}
            </pre>
          </div>
        </div>
        <DialogFooter className="mt-4 flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-end">
          <Button variant="outline" size="sm" onClick={() => setOpen(false)}>
            ปิด
          </Button>
          {onResend && (
            <Button
              variant={log.isSuccess ? 'outline' : 'default'}
              size="sm"
              className="gap-1.5"
              disabled={isResending}
              onClick={() => onResend(log.id)}
            >
              {isResending ? (
                <Spinner className="size-3.5" />
              ) : (
                <IconRefresh size={14} />
              )}
              <span>{isResending ? t('resending') : t('resend')}</span>
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
