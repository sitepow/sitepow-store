'use client'

import { useCopyToClipboard } from '@/hooks/use-copy-to-clipboard'
import { IconCheck, IconCopy } from '@tabler/icons-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

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
}

export function WebhookLogDetailDialog({
  open,
  setOpen,
  log,
}: WebhookLogDetailDialogProps) {
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
            <DialogTitle>รายละเอียดการส่ง Webhook</DialogTitle>
            <Badge variant={log.isSuccess ? 'default' : 'destructive'}>
              {log.isSuccess ? 'Success' : 'Failed'}
              {log.statusCode ? ` (${log.statusCode})` : ''}
            </Badge>
          </div>
          <DialogDescription>
            Event: <span className="font-mono font-medium">{log.event}</span> •{' '}
            ใช้เวลา: {log.executionTimeMs}ms • วันที่:{' '}
            {new Date(log.createdAt).toLocaleString('th-TH')}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          {log.errorMessage && (
            <div className="border-destructive/20 bg-destructive/10 text-destructive rounded-lg border p-3 text-sm">
              <span className="font-semibold">ข้อผิดพลาด: </span>
              {log.errorMessage}
            </div>
          )}
          <div>
            <div className="flex items-center justify-between pb-1.5">
              <span className="text-sm font-semibold">
                Request Payload (ข้อมูลที่ส่งไป)
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
                    <span>คัดลอกแล้ว</span>
                  </>
                ) : (
                  <>
                    <IconCopy size={14} />
                    <span>คัดลอก JSON</span>
                  </>
                )}
              </Button>
            </div>
            <pre className="bg-muted/60 max-h-64 overflow-auto rounded-lg border p-3 font-mono text-xs leading-relaxed">
              {payloadString}
            </pre>
          </div>
          <div>
            <span className="text-sm font-semibold">
              Response Body (ข้อความตอบกลับจากเซิร์ฟเวอร์ของคุณ)
            </span>
            <pre className="bg-muted/60 mt-1.5 max-h-40 overflow-auto rounded-lg border p-3 font-mono text-xs leading-relaxed">
              {log.responseBody || '(ไม่มีข้อมูลตอบกลับ)'}
            </pre>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
