'use client'

import { useState } from 'react'
import toast from 'react-hot-toast'

import {
  useRetryWebhookDelivery,
  useWebhookDeliveries,
} from '@/actions/store/webhook/hooks'
import { formatDateTime } from '@/utils/formatting/date'
import {
  IconAlertCircle,
  IconCheck,
  IconClock,
  IconCopy,
  IconEye,
  IconHistory,
  IconRefresh,
  IconReload,
  IconX,
} from '@tabler/icons-react'

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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Spinner } from '@/components/ui/spinner'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

interface WebhookDeliveryLogsProps {
  storeId: string
  selectedEndpointId?: string
}

interface DeliveryItem {
  id: string
  endpointId: string
  storeId: string
  event: string
  url: string
  payload: unknown
  statusCode: number | null
  responseBody: string | null
  errorMessage: string | null
  durationMs: number | null
  success: boolean
  createdAt: Date | string
  endpoint?: {
    url: string
    description: string | null
  }
}

export function WebhookDeliveryLogs({
  storeId,
  selectedEndpointId,
}: WebhookDeliveryLogsProps) {
  const {
    data: res,
    isLoading,
    refetch,
    isRefetching,
  } = useWebhookDeliveries(storeId, selectedEndpointId)
  const retryMutation = useRetryWebhookDelivery(storeId)

  const [selectedDelivery, setSelectedDelivery] = useState<DeliveryItem | null>(
    null,
  )
  const [copiedPayload, setCopiedPayload] = useState(false)

  const deliveries: DeliveryItem[] = (
    res?.success ? res.data : []
  ) as DeliveryItem[]

  const handleCopyPayload = (payload: unknown) => {
    navigator.clipboard.writeText(JSON.stringify(payload, null, 2))
    setCopiedPayload(true)
    toast.success('คัดลอก JSON Payload แล้ว')
    setTimeout(() => setCopiedPayload(false), 2000)
  }

  const handleRetry = (id: string) => {
    retryMutation.mutate(id)
  }

  return (
    <Card className="border-muted/80 border">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <div>
          <div className="flex items-center gap-2">
            <IconHistory className="text-primary h-5 w-5" />
            <CardTitle className="text-base font-semibold">
              ประวัติการส่งข้อมูล (Delivery Logs)
            </CardTitle>
          </div>
          <CardDescription className="text-xs">
            บันทึกการส่ง Webhook ล่าสุด พร้อมสถานะการตอบรับ (HTTP Status)
            และเวลาที่ใช้
          </CardDescription>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="h-8 gap-1.5 text-xs"
          onClick={() => refetch()}
          disabled={isRefetching || isLoading}
        >
          <IconRefresh
            className={`h-3.5 w-3.5 ${isRefetching ? 'animate-spin' : ''}`}
          />
          รีเฟรช
        </Button>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-10">
            <Spinner />
          </div>
        ) : deliveries.length === 0 ? (
          <div className="text-muted-foreground flex flex-col items-center justify-center py-8 text-center">
            <IconClock className="text-muted-foreground/60 mb-2 h-8 w-8 stroke-1" />
            <p className="text-xs font-medium">ยังไม่มีประวัติการส่ง Webhook</p>
            <p className="text-muted-foreground/80 text-[11px]">
              เมื่อมีการสั่งซื้อหรือกดส่งทดสอบ รายการจะแสดงขึ้นที่นี่อัตโนมัติ
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="text-xs">
                  <TableHead className="w-24">สถานะ</TableHead>
                  <TableHead className="w-32">เหตุการณ์</TableHead>
                  <TableHead>ปลายทาง (URL)</TableHead>
                  <TableHead className="w-24 text-right">เวลาที่ใช้</TableHead>
                  <TableHead className="w-36 text-right">
                    วันเวลาที่ส่ง
                  </TableHead>
                  <TableHead className="w-28 text-center">จัดการ</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {deliveries.map((delivery) => (
                  <TableRow key={delivery.id} className="text-xs">
                    <TableCell>
                      {delivery.success ? (
                        <Badge
                          variant="secondary"
                          className="bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 dark:bg-emerald-500/20 dark:text-emerald-400"
                        >
                          <IconCheck className="mr-1 h-3 w-3" />
                          {delivery.statusCode || '200 OK'}
                        </Badge>
                      ) : (
                        <Badge
                          variant="destructive"
                          className="gap-1 font-mono text-[11px]"
                        >
                          <IconX className="h-3 w-3" />
                          {delivery.statusCode
                            ? `${delivery.statusCode} Error`
                            : 'Failed'}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className="font-mono text-[11px]"
                      >
                        {delivery.event}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground max-w-[200px] truncate font-mono text-[11px]">
                      {delivery.url}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-right font-mono text-[11px]">
                      {delivery.durationMs != null
                        ? `${delivery.durationMs}ms`
                        : '-'}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-right text-[11px] whitespace-nowrap">
                      {formatDateTime(delivery.createdAt)}
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0"
                          title="ดูข้อมูลที่ส่ง"
                          onClick={() => setSelectedDelivery(delivery)}
                        >
                          <IconEye className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0"
                          title="ส่งซ้ำ (Retry)"
                          disabled={retryMutation.isPending}
                          onClick={() => handleRetry(delivery.id)}
                        >
                          <IconReload
                            className={`h-3.5 w-3.5 ${
                              retryMutation.isPending &&
                              retryMutation.variables === delivery.id
                                ? 'animate-spin'
                                : ''
                            }`}
                          />
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

      {/* Details Dialog */}
      <Dialog
        open={Boolean(selectedDelivery)}
        onOpenChange={(open) => !open && setSelectedDelivery(null)}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base">
              รายละเอียดการส่ง Webhook
              {selectedDelivery?.success ? (
                <Badge
                  variant="secondary"
                  className="bg-emerald-500/10 text-emerald-600"
                >
                  สำเร็จ (HTTP {selectedDelivery.statusCode})
                </Badge>
              ) : (
                <Badge variant="destructive">
                  ไม่สำเร็จ (
                  {selectedDelivery?.statusCode
                    ? `HTTP ${selectedDelivery.statusCode}`
                    : 'Error'}
                  )
                </Badge>
              )}
            </DialogTitle>
            <DialogDescription className="text-xs">
              ส่งเมื่อ{' '}
              {selectedDelivery
                ? formatDateTime(selectedDelivery.createdAt)
                : ''}{' '}
              (ใช้เวลา {selectedDelivery?.durationMs ?? 0}ms)
            </DialogDescription>
          </DialogHeader>

          {selectedDelivery && (
            <div className="space-y-4 text-xs">
              <div className="bg-muted/40 space-y-1 rounded-lg border p-3">
                <div className="text-muted-foreground flex items-center justify-between">
                  <span>URL ปลายทาง:</span>
                  <span className="text-foreground font-mono">
                    {selectedDelivery.url}
                  </span>
                </div>
                <div className="text-muted-foreground flex items-center justify-between">
                  <span>Event:</span>
                  <Badge variant="outline" className="font-mono text-[11px]">
                    {selectedDelivery.event}
                  </Badge>
                </div>
                {selectedDelivery.errorMessage && (
                  <div className="text-destructive flex items-start gap-1">
                    <IconAlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                    <span>ข้อผิดพลาด: {selectedDelivery.errorMessage}</span>
                  </div>
                )}
              </div>

              {/* Sent Payload */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between font-semibold">
                  <span>ข้อมูลที่ส่ง (Request Payload JSON)</span>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-6 gap-1 text-[11px]"
                    onClick={() => handleCopyPayload(selectedDelivery.payload)}
                  >
                    {copiedPayload ? (
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
                <pre className="max-h-56 overflow-auto rounded-lg bg-neutral-900 p-3 font-mono text-[11px] text-neutral-200 dark:bg-neutral-950">
                  {JSON.stringify(selectedDelivery.payload, null, 2)}
                </pre>
              </div>

              {/* Response Body */}
              {selectedDelivery.responseBody && (
                <div className="space-y-1.5">
                  <div className="text-muted-foreground font-semibold">
                    การตอบกลับจากเซิร์ฟเวอร์ปลายทาง (Response Body)
                  </div>
                  <pre className="bg-muted/70 text-foreground max-h-36 overflow-auto rounded-lg p-3 font-mono text-[11px]">
                    {selectedDelivery.responseBody}
                  </pre>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setSelectedDelivery(null)}
                >
                  ปิด
                </Button>
                <Button
                  size="sm"
                  className="gap-1.5"
                  disabled={retryMutation.isPending}
                  onClick={() => handleRetry(selectedDelivery.id)}
                >
                  <IconReload
                    className={`h-3.5 w-3.5 ${
                      retryMutation.isPending ? 'animate-spin' : ''
                    }`}
                  />
                  ส่งข้อมูลนี้ซ้ำ (Retry)
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Card>
  )
}
