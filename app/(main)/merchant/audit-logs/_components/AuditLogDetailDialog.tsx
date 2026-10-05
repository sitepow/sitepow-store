'use client'

import { useState } from 'react'
import { GetActivityLogItem } from '@/actions/analytics/activity-log/actions'
import { formatDateTime } from '@/utils/formatting/date'
import {
  IconArrowRight,
  IconCheck,
  IconCode,
  IconCopy,
  IconDatabase,
  IconInfoCircle,
  IconNetwork,
  IconTarget,
  IconUser,
} from '@tabler/icons-react'
import toast from 'react-hot-toast'

import {
  ENTITY_LABEL_TH,
  extractStructuredDetails,
  formatAuditLogSummary,
} from '@/utils/activity/formatter'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

import { ActionBadge } from './ActionBadge'
import { ActorBadge } from './ActorBadge'

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
  const [copiedKey, setCopiedKey] = useState<string | null>(null)

  if (!logItem) return null

  const summary = formatAuditLogSummary(logItem)
  const structuredItems = extractStructuredDetails(logItem.details)
  const detailsObj = (logItem.details as Record<string, unknown>) || {}

  const actorName =
    logItem.employee?.name ||
    logItem.user?.name ||
    (logItem.actorType === 'SYSTEM' ? 'ระบบอัตโนมัติ' : 'ผู้ใช้งานระบบ')

  const actorEmail = logItem.employee?.email || logItem.user?.email || null
  const actorImage = logItem.user?.image || null

  const entityThai = ENTITY_LABEL_TH[logItem.entity] || logItem.entity

  const handleCopy = (text: string, label: string, keyName: string) => {
    navigator.clipboard.writeText(text)
    setCopiedKey(keyName)
    toast.success(`คัดลอก ${label} เรียบร้อยแล้ว`)
    setTimeout(() => {
      setCopiedKey(null)
    }, 2000)
  }

  // Check for status transition (from -> to)
  const hasStatusTransition = Boolean(detailsObj.from && detailsObj.to)

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-6">
        <DialogHeader className="space-y-3 pb-2 border-b">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <ActionBadge action={logItem.action} />
              <ActorBadge actorType={logItem.actorType} />
            </div>
            <span className="text-xs text-muted-foreground font-mono">
              {formatDateTime(logItem.createdAt)}
            </span>
          </div>

          <div>
            <DialogTitle className="text-base font-semibold text-foreground leading-snug">
              {summary}
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground mt-1">
              รหัสบันทึก: <span className="font-mono">{logItem.id}</span>
            </DialogDescription>
          </div>
        </DialogHeader>

        {/* 3 Overview Info Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 my-2">
          {/* Actor Card */}
          <div className="rounded-lg border bg-muted/40 p-3 space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
              <IconUser size={14} />
              <span>ผู้ดำเนินการ</span>
            </div>
            <div className="flex items-center gap-2.5">
              <Avatar className="h-8 w-8 border">
                {actorImage && <AvatarImage src={actorImage} alt={actorName} />}
                <AvatarFallback className="text-[11px] font-semibold bg-primary/10 text-primary">
                  {actorName.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium truncate text-foreground">
                  {actorName}
                </p>
                {actorEmail && (
                  <p className="text-[11px] text-muted-foreground truncate font-mono">
                    {actorEmail}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Target Entity Card */}
          <div className="rounded-lg border bg-muted/40 p-3 space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
              <IconTarget size={14} />
              <span>เป้าหมาย (Entity)</span>
            </div>
            <div>
              <p className="text-xs font-semibold text-foreground">
                {entityThai} <span className="text-[11px] font-normal text-muted-foreground">({logItem.entity})</span>
              </p>
              {logItem.entityId ? (
                <div className="flex items-center gap-1.5 mt-1">
                  <Badge variant="outline" className="font-mono text-[10px] truncate max-w-[130px]">
                    {logItem.entityId}
                  </Badge>
                  <button
                    type="button"
                    onClick={() =>
                      handleCopy(logItem.entityId!, 'Entity ID', 'entityId')
                    }
                    className="text-muted-foreground hover:text-foreground transition-colors"
                    title="คัดลอก Entity ID"
                  >
                    {copiedKey === 'entityId' ? (
                      <IconCheck size={12} className="text-emerald-500" />
                    ) : (
                      <IconCopy size={12} />
                    )}
                  </button>
                </div>
              ) : (
                <p className="text-[11px] text-muted-foreground mt-1">-</p>
              )}
            </div>
          </div>

          {/* Network & Device Card */}
          <div className="rounded-lg border bg-muted/40 p-3 space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
              <IconNetwork size={14} />
              <span>เครือข่าย & IP</span>
            </div>
            <div>
              {logItem.ipAddress ? (
                <div className="flex items-center gap-1.5">
                  <span className="font-mono text-xs font-medium text-foreground">
                    {logItem.ipAddress}
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      handleCopy(logItem.ipAddress!, 'IP Address', 'ip')
                    }
                    className="text-muted-foreground hover:text-foreground transition-colors"
                    title="คัดลอก IP Address"
                  >
                    {copiedKey === 'ip' ? (
                      <IconCheck size={12} className="text-emerald-500" />
                    ) : (
                      <IconCopy size={12} />
                    )}
                  </button>
                </div>
              ) : (
                <p className="text-xs text-muted-foreground">ระบบภายใน (Internal)</p>
              )}
              <p className="text-[11px] text-muted-foreground mt-1">
                Store ID: {logItem.storeId ? logItem.storeId.slice(0, 10) + '...' : 'ทั้งหมด'}
              </p>
            </div>
          </div>
        </div>

        {/* Status Transition Highlight if applicable */}
        {hasStatusTransition && (
          <div className="rounded-lg border bg-primary/5 border-primary/20 p-3 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <IconInfoCircle size={16} className="text-primary shrink-0" />
              <span className="text-xs font-medium text-foreground">
                การเปลี่ยนแปลงสถานะ:
              </span>
            </div>
            <div className="flex items-center gap-2 font-mono text-xs">
              <Badge variant="secondary" className="px-2 py-0.5">
                {String(detailsObj.from)}
              </Badge>
              <IconArrowRight size={14} className="text-muted-foreground" />
              <Badge className="bg-primary px-2 py-0.5 text-primary-foreground">
                {String(detailsObj.to)}
              </Badge>
            </div>
          </div>
        )}

        {/* Tabbed view for structured vs raw JSON */}
        <Tabs defaultValue="structured" className="w-full mt-2">
          <TabsList className="grid grid-cols-2 h-8 w-64 mb-3">
            <TabsTrigger value="structured" className="text-xs gap-1.5">
              <IconDatabase size={13} />
              ข้อมูลสรุป
            </TabsTrigger>
            <TabsTrigger value="raw" className="text-xs gap-1.5">
              <IconCode size={13} />
              JSON Payload
            </TabsTrigger>
          </TabsList>

          <TabsContent value="structured">
            {structuredItems.length === 0 ? (
              <div className="rounded-lg border border-dashed p-6 text-center text-xs text-muted-foreground">
                ไม่มีรายละเอียดพารามิเตอร์เพิ่มเติมสำหรับรายการนี้
              </div>
            ) : (
              <div className="rounded-lg border overflow-hidden">
                <table className="w-full text-xs text-left">
                  <thead className="bg-muted/50 border-b text-muted-foreground">
                    <tr>
                      <th className="py-2 px-3 font-medium w-1/3">รายการ</th>
                      <th className="py-2 px-3 font-medium">ค่าที่บันทึก</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {structuredItems.map((item, index) => (
                      <tr key={index} className="hover:bg-muted/30 transition-colors">
                        <td className="py-2.5 px-3 font-medium text-foreground">
                          {item.label}
                          <span className="block text-[10px] text-muted-foreground font-mono">
                            {item.key}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 font-mono text-muted-foreground">
                          <span className="text-foreground font-sans">
                            {item.value}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </TabsContent>

          <TabsContent value="raw">
            <div className="relative rounded-lg border bg-zinc-950 p-4 text-[11px] leading-relaxed font-mono text-zinc-100 overflow-x-auto max-h-72">
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  handleCopy(
                    JSON.stringify(logItem.details ?? {}, null, 2),
                    'JSON Payload',
                    'rawJson',
                  )
                }
                className="absolute top-2.5 right-2.5 h-7 px-2 text-[10px] gap-1 bg-zinc-900 border-zinc-700 text-zinc-200 hover:bg-zinc-800"
              >
                {copiedKey === 'rawJson' ? (
                  <>
                    <IconCheck size={11} className="text-emerald-400" />
                    คัดลอกแล้ว
                  </>
                ) : (
                  <>
                    <IconCopy size={11} />
                    คัดลอก JSON
                  </>
                )}
              </Button>
              <pre>{JSON.stringify(logItem.details ?? {}, null, 2)}</pre>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
