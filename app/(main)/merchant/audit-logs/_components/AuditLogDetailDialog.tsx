'use client'

import { useTranslations } from 'next-intl'

import { GetActivityLogItem } from '@/actions/activity-log'
import { ActorType, LogAction } from '@/generated/prisma/enums'
import { IconTerminal } from '@tabler/icons-react'

import { DialogHeaderIcon } from '@/components/DialogHeaderIcon'
import { Dialog, DialogContent, DialogHeader } from '@/components/ui/dialog'

export interface ActivityLogItem {
  id: string
  storeId: string
  action: LogAction
  actorType: ActorType
  employeeName: string
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
  const t = useTranslations('merchant.auditLogs.detailDialog')

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogHeaderIcon
            icon={IconTerminal}
            title={t('title')}
            description={t('description')}
          />
        </DialogHeader>
        <div className="bg-foreground/5 text-foreground max-h-90 overflow-x-auto rounded-md border p-4 text-[11px] leading-relaxed">
          <pre>
            {JSON.stringify(
              logItem?.details || { message: t('noDetails') },
              null,
              2,
            )}
          </pre>
        </div>
      </DialogContent>
    </Dialog>
  )
}
