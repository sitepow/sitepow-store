'use client'

import { useState } from 'react'
import toast from 'react-hot-toast'

import {
  useDeleteWebhookEndpoint,
  useRegenerateWebhookSecret,
  useTestWebhookEndpoint,
  useUpdateWebhookEndpoint,
  useWebhookEndpoints,
} from '@/actions/store/webhook/hooks'
import { ALL_STORES, useStoreFilter } from '@/stores/merchant/use-store-filter'
import {
  IconCheck,
  IconCopy,
  IconDotsVertical,
  IconEdit,
  IconEye,
  IconEyeOff,
  IconInfoCircle,
  IconPlus,
  IconRefresh,
  IconSend,
  IconTrash,
  IconWebhook,
} from '@tabler/icons-react'

import { ActionRequiredAlert } from '@/components/shared/ActionRequiredAlert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Spinner } from '@/components/ui/spinner'
import { Switch } from '@/components/ui/switch'

import { WebhookDeliveryLogs } from './WebhookDeliveryLogs'
import { WebhookDocsSection } from './WebhookDocsSection'
import { WebhookEndpointDialog } from './WebhookEndpointDialog'

interface EndpointItem {
  id: string
  url: string
  secret: string
  description: string | null
  isActive: boolean
  events: string[]
  _count?: {
    deliveries: number
  }
}

export function WebhookSettingsForm() {
  const { selectedStoreId } = useStoreFilter()
  const storeId = (
    selectedStoreId !== ALL_STORES ? selectedStoreId : ''
  ) as string

  const { data: res, isLoading } = useWebhookEndpoints(storeId)
  const updateMutation = useUpdateWebhookEndpoint(storeId)
  const deleteMutation = useDeleteWebhookEndpoint(storeId)
  const regenerateMutation = useRegenerateWebhookSecret(storeId)
  const testMutation = useTestWebhookEndpoint(storeId)

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingEndpoint, setEditingEndpoint] = useState<EndpointItem | null>(
    null,
  )
  const [revealedSecrets, setRevealedSecrets] = useState<
    Record<string, boolean>
  >({})
  const [copiedSecretId, setCopiedSecretId] = useState<string | null>(null)
  const [copiedUrlId, setCopiedUrlId] = useState<string | null>(null)

  const endpoints: EndpointItem[] = (
    res?.success ? res.data : []
  ) as EndpointItem[]

  const toggleRevealSecret = (id: string) => {
    setRevealedSecrets((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  const handleCopySecret = (id: string, secret: string) => {
    navigator.clipboard.writeText(secret)
    setCopiedSecretId(id)
    toast.success('คัดลอก Secret Key แล้ว')
    setTimeout(() => setCopiedSecretId(null), 2000)
  }

  const handleCopyUrl = (id: string, url: string) => {
    navigator.clipboard.writeText(url)
    setCopiedUrlId(id)
    toast.success('คัดลอก URL แล้ว')
    setTimeout(() => setCopiedUrlId(null), 2000)
  }

  const handleToggleActive = (endpoint: EndpointItem) => {
    updateMutation.mutate({
      id: endpoint.id,
      input: { isActive: !endpoint.isActive },
    })
  }

  const handleDelete = (id: string) => {
    if (confirm('คุณแน่ใจหรือไม่ว่าต้องการลบ Webhook Endpoint นี้?')) {
      deleteMutation.mutate(id)
    }
  }

  const handleRegenerateSecret = (id: string) => {
    if (
      confirm(
        'การสร้าง Secret Key ใหม่จะทำให้การตรวจสอบ Signature เดิมใช้งานไม่ได้ คุณต้องนำ Secret ใหม่ไปอัปเดตที่เซิร์ฟเวอร์ของคุณ ต้องการดำเนินการต่อหรือไม่?',
      )
    ) {
      regenerateMutation.mutate(id)
    }
  }

  const handleTestEndpoint = (id: string) => {
    testMutation.mutate(id)
  }

  const openCreateDialog = () => {
    setEditingEndpoint(null)
    setDialogOpen(true)
  }

  const openEditDialog = (ep: EndpointItem) => {
    setEditingEndpoint(ep)
    setDialogOpen(true)
  }

  if (!storeId) {
    return <ActionRequiredAlert />
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-12">
          <Spinner />
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Endpoints Management Card */}
      <Card className="border-muted/80 border">
        <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <IconWebhook className="text-primary h-5 w-5" />
              <CardTitle className="text-base font-semibold">
                การตั้งค่า Webhook (Webhooks & API Hooks)
              </CardTitle>
            </div>
            <CardDescription className="mt-1 text-xs">
              ส่งการแจ้งเตือนเหตุการณ์ของออเดอร์ไปยัง URL ของคุณแบบ Real-time
              เหมาะสำหรับเชื่อมต่อบอทเติมเกมอัตโนมัติ หรือส่งข้อมูลไปยัง API
              ลูกค้า
            </CardDescription>
          </div>
          <Button
            size="sm"
            onClick={openCreateDialog}
            className="h-8 gap-1.5 self-start text-xs sm:self-auto"
          >
            <IconPlus className="h-3.5 w-3.5" /> เพิ่ม Webhook Endpoint
          </Button>
        </CardHeader>

        <CardContent className="space-y-4">
          {endpoints.length === 0 ? (
            <div className="border-muted flex flex-col items-center justify-center rounded-xl border border-dashed p-8 text-center">
              <div className="bg-primary/10 text-primary flex h-12 w-12 items-center justify-center rounded-full">
                <IconWebhook className="h-6 w-6" />
              </div>
              <h3 className="mt-3 text-sm font-semibold">
                ยังไม่มีการตั้งค่า Webhook Endpoint
              </h3>
              <p className="text-muted-foreground mt-1 max-w-sm text-xs">
                เพิ่ม Endpoint แรกของคุณเพื่อเริ่มรับข้อมูลออเดอร์
                และนำไปเชื่อมต่อกับระบบเติมเกมอัตโนมัติหรือเซิร์ฟเวอร์ภายนอกได้ทันที
              </p>
              <Button
                size="sm"
                onClick={openCreateDialog}
                className="mt-4 h-8 gap-1.5 text-xs"
              >
                <IconPlus className="h-3.5 w-3.5" /> เริ่มต้นสร้าง Webhook
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {endpoints.map((ep) => {
                const isSecretRevealed = Boolean(revealedSecrets[ep.id])
                const isTesting =
                  testMutation.isPending && testMutation.variables === ep.id

                return (
                  <div
                    key={ep.id}
                    className="bg-card hover:border-primary/40 flex flex-col gap-4 rounded-xl border p-4 shadow-xs transition-all"
                  >
                    <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-foreground text-sm font-semibold">
                            {ep.description || 'Webhook Endpoint'}
                          </span>
                          <Badge
                            variant={ep.isActive ? 'default' : 'secondary'}
                            className="text-[10px]"
                          >
                            {ep.isActive ? 'เปิดใช้งาน' : 'ปิดการใช้งาน'}
                          </Badge>
                          {ep._count && (
                            <span className="text-muted-foreground text-[11px]">
                              ({ep._count.deliveries} ประวัติการส่ง)
                            </span>
                          )}
                        </div>

                        {/* URL with Copy */}
                        <div className="flex items-center gap-1.5 pt-1">
                          <span className="bg-muted/60 text-foreground rounded px-2 py-1 font-mono text-xs">
                            {ep.url}
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-muted-foreground hover:text-foreground h-6 w-6 p-0"
                            title="คัดลอก URL"
                            onClick={() => handleCopyUrl(ep.id, ep.url)}
                          >
                            {copiedUrlId === ep.id ? (
                              <IconCheck className="h-3 w-3 text-emerald-600" />
                            ) : (
                              <IconCopy className="h-3 w-3" />
                            )}
                          </Button>
                        </div>
                      </div>

                      {/* Header controls: Switch & Action buttons */}
                      <div className="flex items-center gap-2 self-end sm:self-auto">
                        <div className="flex items-center gap-1.5">
                          <span className="text-muted-foreground text-xs">
                            {ep.isActive ? 'เปิด' : 'ปิด'}
                          </span>
                          <Switch
                            checked={ep.isActive}
                            onCheckedChange={() => handleToggleActive(ep)}
                            disabled={updateMutation.isPending}
                          />
                        </div>

                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 gap-1 text-xs"
                          disabled={isTesting}
                          onClick={() => handleTestEndpoint(ep.id)}
                        >
                          <IconSend
                            className={`h-3.5 w-3.5 ${
                              isTesting ? 'animate-spin' : ''
                            }`}
                          />
                          ส่งทดสอบ
                        </Button>

                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0"
                            >
                              <IconDotsVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="text-xs">
                            <DropdownMenuItem
                              onClick={() => openEditDialog(ep)}
                              className="gap-2"
                            >
                              <IconEdit className="h-3.5 w-3.5" />{' '}
                              แก้ไขการตั้งค่า
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleRegenerateSecret(ep.id)}
                              className="gap-2"
                            >
                              <IconRefresh className="h-3.5 w-3.5" /> สุ่ม
                              Secret ใหม่
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDelete(ep.id)}
                              className="text-destructive focus:text-destructive gap-2"
                            >
                              <IconTrash className="h-3.5 w-3.5" /> ลบ Endpoint
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>

                    {/* Secret Key Row */}
                    <div className="bg-muted/40 flex flex-wrap items-center justify-between gap-2 rounded-lg border p-2.5 text-xs">
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground font-semibold">
                          Signing Secret:
                        </span>
                        <span className="font-mono text-xs">
                          {isSecretRevealed
                            ? ep.secret
                            : `${ep.secret.slice(0, 10)}••••••••••••••••`}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 gap-1 text-[11px]"
                          onClick={() => toggleRevealSecret(ep.id)}
                        >
                          {isSecretRevealed ? (
                            <>
                              <IconEyeOff className="h-3 w-3" /> ซ่อน
                            </>
                          ) : (
                            <>
                              <IconEye className="h-3 w-3" /> แสดง
                            </>
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 gap-1 text-[11px]"
                          onClick={() => handleCopySecret(ep.id, ep.secret)}
                        >
                          {copiedSecretId === ep.id ? (
                            <>
                              <IconCheck className="h-3 w-3 text-emerald-600" />{' '}
                              คัดลอกแล้ว
                            </>
                          ) : (
                            <>
                              <IconCopy className="h-3 w-3" /> คัดลอก
                            </>
                          )}
                        </Button>
                      </div>
                    </div>

                    {/* Subscribed Events tags */}
                    <div className="flex flex-wrap items-center gap-1.5 pt-1">
                      <span className="text-muted-foreground text-[11px] font-medium">
                        เหตุการณ์ที่รับ:
                      </span>
                      {ep.events.map((ev) => (
                        <Badge
                          key={ev}
                          variant="outline"
                          className="bg-background font-mono text-[10px]"
                        >
                          {ev}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delivery Logs */}
      <WebhookDeliveryLogs storeId={storeId} />

      {/* Developer Docs & Code Samples */}
      <WebhookDocsSection />

      {/* Create/Edit Dialog */}
      <WebhookEndpointDialog
        storeId={storeId}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        endpoint={editingEndpoint}
      />
    </div>
  )
}
