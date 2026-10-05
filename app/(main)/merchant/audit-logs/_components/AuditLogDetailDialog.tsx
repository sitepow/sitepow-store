'use client'

import { useState } from 'react'

import { GetActivityLogItem } from '@/actions/analytics/activity-log/actions'
import { formatDateTime } from '@/utils/formatting/date'
import {
  IconArrowRight,
  IconCheck,
  IconCopy,
} from '@tabler/icons-react'
import toast from 'react-hot-toast'

import {
  ENTITY_LABEL_TH,
  extractStructuredDetails,
  formatAuditLogSummary,
} from '@/utils/activity/formatter'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Field, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

import { ActionBadge } from './ActionBadge'
import { ActorBadge } from './ActorBadge'

interface AuditLogDetailDialogProps {
  logItem: GetActivityLogItem | null
  open: boolean
  setOpen: (v: boolean) => void
}

export function AuditLogDetailDialog({
  logItem,
  open,
  setOpen,
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
  const entityThai = ENTITY_LABEL_TH[logItem.entity] || logItem.entity

  const handleCopy = (text: string, label: string, keyName: string) => {
    navigator.clipboard.writeText(text)
    setCopiedKey(keyName)
    toast.success(`คัดลอก ${label} เรียบร้อยแล้ว`)
    setTimeout(() => {
      setCopiedKey(null)
    }, 2000)
  }

  const hasStatusTransition = Boolean(detailsObj.from && detailsObj.to)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>รายละเอียดประวัติกิจกรรม</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4">
          <Field>
            <FieldLabel>กิจกรรมที่เกิดขึ้น</FieldLabel>
            <Input value={summary} disabled />
          </Field>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field>
              <FieldLabel>วันและเวลา</FieldLabel>
              <Input value={formatDateTime(logItem.createdAt)} disabled />
            </Field>

            <Field>
              <FieldLabel>ประเภทเหตุการณ์</FieldLabel>
              <div className="flex h-9 items-center">
                <ActionBadge action={logItem.action} />
              </div>
            </Field>

            <Field>
              <FieldLabel>ผู้ดำเนินการ</FieldLabel>
              <Input
                value={
                  actorEmail ? `${actorName} (${actorEmail})` : actorName
                }
                disabled
              />
            </Field>

            <Field>
              <FieldLabel>บทบาทผู้ดำเนินการ</FieldLabel>
              <div className="flex h-9 items-center">
                <ActorBadge actorType={logItem.actorType} />
              </div>
            </Field>

            <Field>
              <FieldLabel>เป้าหมาย (Entity)</FieldLabel>
              <Input value={`${entityThai} (${logItem.entity})`} disabled />
            </Field>

            <Field>
              <FieldLabel>รหัสอ้างอิงเป้าหมาย (Entity ID)</FieldLabel>
              <div className="relative">
                <Input
                  value={logItem.entityId || '-'}
                  disabled
                  className="pr-9"
                />
                {logItem.entityId && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() =>
                      handleCopy(logItem.entityId!, 'Entity ID', 'entityId')
                    }
                    className="text-muted-foreground hover:text-foreground absolute top-1/2 right-1 size-7 -translate-y-1/2"
                  >
                    {copiedKey === 'entityId' ? (
                      <IconCheck size={14} className="text-emerald-500" />
                    ) : (
                      <IconCopy size={14} />
                    )}
                  </Button>
                )}
              </div>
            </Field>

            <Field>
              <FieldLabel>IP Address</FieldLabel>
              <Input
                value={logItem.ipAddress || 'ระบบภายใน (Internal)'}
                disabled
              />
            </Field>

            <Field>
              <FieldLabel>รหัสร้านค้า (Store ID)</FieldLabel>
              <Input value={logItem.storeId || 'ทั้งหมด'} disabled />
            </Field>
          </div>

          {hasStatusTransition && (
            <div className="space-y-3 border-t pt-4">
              <span className="text-sm font-semibold">
                การเปลี่ยนแปลงสถานะ
              </span>
              <div className="bg-card flex items-center justify-between rounded-md border p-3 text-sm">
                <Badge variant="outline">{String(detailsObj.from)}</Badge>
                <IconArrowRight className="text-muted-foreground size-4" />
                <Badge variant="default">{String(detailsObj.to)}</Badge>
              </div>
            </div>
          )}

          <div className="space-y-3 border-t pt-4">
            <span className="text-sm font-semibold">
              ข้อมูลพารามิเตอร์เพิ่มเติม
            </span>
            <Tabs defaultValue="structured" className="w-full">
              <TabsList className="grid grid-cols-2 w-full sm:w-64 mb-3">
                <TabsTrigger value="structured">ข้อมูลสรุป</TabsTrigger>
                <TabsTrigger value="raw">JSON Payload</TabsTrigger>
              </TabsList>

              <TabsContent value="structured">
                {structuredItems.length === 0 ? (
                  <div className="rounded-md border border-dashed p-6 text-center text-xs text-muted-foreground">
                    ไม่มีรายละเอียดพารามิเตอร์เพิ่มเติมสำหรับรายการนี้
                  </div>
                ) : (
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-1/3">รายการ</TableHead>
                          <TableHead>ค่าที่บันทึก</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {structuredItems.map((item, index) => (
                          <TableRow key={index}>
                            <TableCell className="font-medium align-top">
                              <span>{item.label}</span>
                              <span className="block text-[11px] text-muted-foreground ">
                                {item.key}
                              </span>
                            </TableCell>
                            <TableCell className="text-muted-foreground align-top">
                              <span className="text-foreground whitespace-pre-wrap font-sans">
                                {item.value}
                              </span>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="raw">
                <div className="relative rounded-md border bg-muted/40 p-3">
                  <div className="flex items-center justify-between pb-2 mb-2 border-b">
                    <span className="text-xs text-muted-foreground ">
                      Raw JSON
                    </span>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        handleCopy(
                          JSON.stringify(logItem.details ?? {}, null, 2),
                          'JSON Payload',
                          'rawJson',
                        )
                      }
                      className="h-7 text-xs"
                    >
                      {copiedKey === 'rawJson' ? (
                        <>
                          <IconCheck
                            size={12}
                            className="text-emerald-500 mr-1"
                          />
                          คัดลอกแล้ว
                        </>
                      ) : (
                        <>
                          <IconCopy size={12} className="mr-1" />
                          คัดลอก JSON
                        </>
                      )}
                    </Button>
                  </div>
                  <pre className=" text-xs overflow-x-auto max-h-56 leading-relaxed">
                    {JSON.stringify(logItem.details ?? {}, null, 2)}
                  </pre>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>

        <DialogFooter className="mt-2 flex items-center justify-end border-t pt-4">
          <Button variant="outline" onClick={() => setOpen(false)}>
            ปิดหน้าต่าง
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}