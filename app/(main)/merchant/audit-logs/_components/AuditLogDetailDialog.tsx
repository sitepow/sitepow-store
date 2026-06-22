'use client'

import { GetActivityLogItem } from '@/actions/activity-log'
import { ActorType, LogAction } from '@/generated/prisma/enums'
import { IconTerminal } from '@tabler/icons-react'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

export interface ActivityLogItem {
  id: string
  storeId: string
  action: LogAction
  actorType: ActorType
  staffName: string
  entity: string
  entityId: string
  ipAddress: string | null
  createdAt: string
  details: Record<string, unknown> | null
}

interface AuditLogDetailDialogProps {
  logItem: GetActivityLogItem | null
  isOpen: boolean
  onOpenChange: (open: boolean) => void
}

export function AuditLogDetailDialog({
  logItem,
  isOpen,
  onOpenChange,
}: AuditLogDetailDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-foreground flex items-center gap-1.5 text-sm font-semibold">
            <IconTerminal size={18} className="text-muted-foreground" />
            ข้อมูลโครงสร้างกิจกรรมเชิงลึก (Metadata)
          </DialogTitle>
          <DialogDescription className="text-xs">
            ชุดข้อมูลดิบ (Payload Details) ในรูปแบบ JSON
            ที่ระบบหลังบ้านบันทึกเก็บไว้ขณะเกิดรายการนี้
          </DialogDescription>
        </DialogHeader>
        <div className="bg-foreground/5 text-foreground max-h-90 overflow-x-auto rounded-md border p-4 text-[11px] leading-relaxed">
          <pre>
            {JSON.stringify(
              logItem?.details || { message: 'ไม่มีข้อมูลรายละเอียดเพิ่มเติม' },
              null,
              2,
            )}
          </pre>
        </div>
      </DialogContent>
    </Dialog>
  )
}
