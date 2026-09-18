'use client'

import { useTranslations } from 'next-intl'
import {
  IconCheck,
  IconCopy,
  IconEdit,
  IconEye,
  IconEyeOff,
  IconPlus,
  IconRefresh,
  IconSend,
  IconTrash,
  IconWebhook,
} from '@tabler/icons-react'

import { StoreWebhookEndpointItem } from '@/actions/webhook'
import { PageTabHeader } from '@/components/PageTabHeader'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Spinner } from '@/components/ui/spinner'
import { Switch } from '@/components/ui/switch'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

interface WebhookEndpointsTableProps {
  endpoints: StoreWebhookEndpointItem[]
  isLoading: boolean
  activeEndpointId?: string
  revealedSecrets: Record<string, boolean>
  copiedId: string | null
  testingEndpointId: string | null
  isTesting: boolean
  isDeleting: boolean
  isRegenerating: boolean
  onSelectEndpoint: (id: string) => void
  onOpenAdd: () => void
  onOpenEdit: (endpoint: StoreWebhookEndpointItem) => void
  onDelete: (id: string) => void
  onRegenerate: (id: string) => void
  onTestPing: (id: string) => void
  onCopySecret: (id: string, secret: string) => void
  onToggleRevealSecret: (id: string) => void
  onToggleActive: (endpoint: StoreWebhookEndpointItem, checked: boolean) => void
  getEventLabel: (eventId: string) => string
}

export function WebhookEndpointsTable({
  endpoints,
  isLoading,
  activeEndpointId,
  revealedSecrets,
  copiedId,
  testingEndpointId,
  isTesting,
  isDeleting,
  isRegenerating,
  onSelectEndpoint,
  onOpenAdd,
  onOpenEdit,
  onDelete,
  onRegenerate,
  onTestPing,
  onCopySecret,
  onToggleRevealSecret,
  onToggleActive,
  getEventLabel,
}: WebhookEndpointsTableProps) {
  const t = useTranslations('merchant.settings.webhook')

  return (
    <Card>
      <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <PageTabHeader
          variant="secondary"
          icon={IconWebhook}
          title={t('title')}
          description={t('description')}
          endContent={
            <Button onClick={onOpenAdd} className="shrink-0">
              <IconPlus size={16} />
              <span>{t('addEndpoint')}</span>
            </Button>
          }
        />
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex h-32 items-center justify-center">
            <Spinner className="size-6" />
          </div>
        ) : endpoints.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed p-8 text-center">
            <div className="bg-muted rounded-full p-3">
              <IconWebhook className="text-muted-foreground size-8" />
            </div>
            <h3 className="mt-3 text-base font-semibold">{t('emptyTitle')}</h3>
            <p className="text-muted-foreground mt-1 max-w-sm text-sm">
              {t('emptyDesc')}
            </p>
            <Button onClick={onOpenAdd} className="mt-4 gap-1.5">
              <IconPlus size={16} />
              <span>{t('emptyButton')}</span>
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="overflow-x-auto rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('urlCol')}</TableHead>
                    <TableHead>{t('eventsCol')}</TableHead>
                    <TableHead>{t('secretCol')}</TableHead>
                    <TableHead className="text-center">
                      {t('statusCol')}
                    </TableHead>
                    <TableHead className="text-right">
                      {t('actionsCol')}
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {endpoints.map((endpoint) => {
                    const isRevealed = !!revealedSecrets[endpoint.id]
                    const isThisTesting = testingEndpointId === endpoint.id

                    return (
                      <TableRow
                        key={endpoint.id}
                        className={
                          activeEndpointId === endpoint.id
                            ? 'bg-muted/30'
                            : undefined
                        }
                        onClick={() => onSelectEndpoint(endpoint.id)}
                      >
                        <TableCell className="max-w-xs">
                          <div className="max-w-52 min-w-52 text-sm wrap-break-word whitespace-pre-line">
                            {endpoint.url}
                          </div>
                          {endpoint.description && (
                            <div className="text-muted-foreground text-xs">
                              {endpoint.description}
                            </div>
                          )}
                        </TableCell>

                        <TableCell>
                          <div className="flex max-w-52 min-w-52 flex-wrap gap-1 wrap-break-word whitespace-pre-line">
                            {endpoint.events.map((ev) => (
                              <Badge
                                key={ev}
                                variant={
                                  ev === 'order.paid' ? 'default' : 'secondary'
                                }
                                className="text-xs"
                              >
                                {getEventLabel(ev)}
                              </Badge>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1.5 text-xs">
                            <span className="max-w-52 min-w-52 wrap-break-word whitespace-pre-line">
                              {isRevealed
                                ? endpoint.secret
                                : `${endpoint.secret.slice(0, 10)}••••••••••••`}
                            </span>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="size-6"
                              onClick={(e) => {
                                e.stopPropagation()
                                onToggleRevealSecret(endpoint.id)
                              }}
                              title={isRevealed ? t('hide') : t('reveal')}
                            >
                              {isRevealed ? (
                                <IconEyeOff size={13} />
                              ) : (
                                <IconEye size={13} />
                              )}
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="size-6"
                              onClick={(e) => {
                                e.stopPropagation()
                                onCopySecret(endpoint.id, endpoint.secret)
                              }}
                              title={t('copy')}
                            >
                              {copiedId === endpoint.id ? (
                                <IconCheck
                                  size={13}
                                  className="text-emerald-500"
                                />
                              ) : (
                                <IconCopy size={13} />
                              )}
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-muted-foreground hover:text-foreground size-6"
                              onClick={(e) => {
                                e.stopPropagation()
                                onRegenerate(endpoint.id)
                              }}
                              disabled={isRegenerating}
                              title={t('regenerate')}
                            >
                              <IconRefresh size={13} />
                            </Button>
                          </div>
                        </TableCell>

                        <TableCell className="text-center">
                          <div
                            onClick={(e) => e.stopPropagation()}
                            className="inline-block"
                          >
                            <Switch
                              checked={endpoint.isActive}
                              onCheckedChange={(checked) =>
                                onToggleActive(endpoint, checked)
                              }
                            />
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div
                            className="flex items-center justify-end gap-1"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8 gap-1 px-2.5 text-xs"
                              onClick={() => onTestPing(endpoint.id)}
                              disabled={isTesting && isThisTesting}
                            >
                              {isThisTesting ? (
                                <Spinner className="h-3.5 w-3.5" />
                              ) : (
                                <IconSend size={13} />
                              )}
                              <span>{t('testPing')}</span>
                            </Button>
                            <Button
                              variant="outline"
                              size="icon"
                              className="size-8"
                              onClick={() => onOpenEdit(endpoint)}
                              title={t('edit')}
                            >
                              <IconEdit size={15} />
                            </Button>
                            <Button
                              variant="outline"
                              size="icon"
                              className="size-8"
                              onClick={() => onDelete(endpoint.id)}
                              disabled={isDeleting}
                              title={t('delete')}
                            >
                              <IconTrash size={15} />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
