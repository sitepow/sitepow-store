'use client'

import { useMemo, useState } from 'react'

import { IconEye, IconHistory } from '@tabler/icons-react'

import { PageTabHeader } from '@/components/PageTabHeader'
import { TableEmptyRow } from '@/components/TableEmptyRow'
import { Button } from '@/components/ui/button'
import { Field, FieldLabel } from '@/components/ui/field'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

import { ActionBadge } from './_components/ActionBadge'
import { ActorBadge } from './_components/ActorBadge'
import {
  ActivityLogItem,
  AuditLogDetailDialog,
} from './_components/AuditLogDetailDialog'
import { AuditLogFilters } from './_components/AuditLogFilters'

const MOCK_ACTIVITY_LOGS: ActivityLogItem[] = [
  {
    id: 'log-101',
    storeId: 'store-1',
    action: 'UPDATE_STOCK',
    actorType: 'MERCHANT',
    staffName: 'พนักงาน มินทร์ (สาขาสยาม)',
    entity: 'ProductStock',
    entityId: 'stock-v42',
    ipAddress: '182.52.114.45',
    createdAt: '2026-05-17 14:32:10',
    details: {
      product: 'เสื้อเชิ้ตโอเวอร์ไซส์ มินิมอล',
      prevStock: 15,
      newStock: 50,
      reason: 'รับสินค้าเข้าคลังสาขา',
    },
  },
  {
    id: 'log-102',
    storeId: 'store-1',
    action: 'CREATE_ORDER',
    actorType: 'SYSTEM',
    staffName: 'ระบบ AI Webhook',
    entity: 'Order',
    entityId: 'ord-9942',
    ipAddress: '127.0.0.1',
    createdAt: '2026-05-17 10:14:55',
    details: {
      amount: 490,
      bank: 'K-Bank',
      status: 'MATCHED_SUCCESS',
      confidence: '99.2%',
    },
  },
  {
    id: 'log-103',
    storeId: 'store-3',
    action: 'DELETE_PRODUCT',
    actorType: 'MERCHANT',
    staffName: 'ผู้จัดการ เอก (สาขาเซ็นทรัลเวิลด์)',
    entity: 'Product',
    entityId: 'prod-881',
    ipAddress: '27.55.4.189',
    createdAt: '2026-05-16 11:20:02',
    details: {
      sku: 'GA-CASE-IP15',
      name: 'เคสหนังแท้ iPhone 15',
      deletedBy: 'staff-id-9',
    },
  },
  {
    id: 'log-104',
    storeId: 'store-1',
    action: 'MANAGE_STAFF',
    actorType: 'SUPER_ADMIN',
    staffName: 'คุณเจ้าของระบบ (แอดมินหลัก)',
    entity: 'Staff',
    entityId: 'staff-id-12',
    ipAddress: '171.96.22.10',
    createdAt: '2026-05-15 16:45:12',
    details: {
      task: 'เพิ่มสิทธิ์พนักงานใหม่',
      role: 'CASHIER',
      assignedBranch: 'สาขาอารีย์',
    },
  },
]

export function AuditLogsContent() {
  const [selectedStoreId, setSelectedStoreId] = useState<string>('store-1')
  const [actionFilter, setActionFilter] = useState<string>('all')
  const [actorFilter, setActorFilter] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')

  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [activeLogItem, setActiveLogItem] = useState<ActivityLogItem | null>(
    null,
  )

  const filteredLogs = useMemo(() => {
    return MOCK_ACTIVITY_LOGS.filter((log) => {
      const matchesStore = log.storeId === selectedStoreId
      const matchesAction =
        actionFilter === 'all' || log.action === actionFilter
      const matchesActor =
        actorFilter === 'all' || log.actorType === actorFilter

      const targetQuery = searchQuery.toLowerCase().trim()
      const matchesSearch =
        !targetQuery ||
        log.entityId.toLowerCase().includes(targetQuery) ||
        log.staffName.toLowerCase().includes(targetQuery) ||
        log.entity.toLowerCase().includes(targetQuery)

      return matchesStore && matchesAction && matchesActor && matchesSearch
    })
  }, [selectedStoreId, actionFilter, actorFilter, searchQuery])

  const handleOpenDetails = (log: ActivityLogItem) => {
    setActiveLogItem(log)
    setIsDialogOpen(true)
  }

  return (
    <div className="space-y-5">
      <PageTabHeader
        icon={IconHistory}
        title="ประวัติกิจกรรมระบบ"
        description="ตรวจสอบบันทึก Log การกระทำและเข้าถึงข้อมูลอย่างละเอียด เพื่อความโปร่งใสและการรักษาความปลอดภัยภายในองค์กร"
        endContent={
          <Field className="w-fit">
            <FieldLabel>กรองตามร้านค้า</FieldLabel>
            <Select value={selectedStoreId} onValueChange={setSelectedStoreId}>
              <SelectTrigger className="bg-background w-full lg:w-60">
                <SelectValue placeholder="เลือกบัญชีร้านค้า" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="store-1">
                  เสื้อผ้าแฟชั่นสไตล์เกาหลี มินิมอล
                </SelectItem>
                <SelectItem value="store-2">
                  ร้านกาแฟหอมกรุ่น Cafe & Bakery
                </SelectItem>
                <SelectItem value="store-3">Gadget & IT Accessories</SelectItem>
              </SelectContent>
            </Select>
          </Field>
        }
      />

      <AuditLogFilters
        searchQuery={searchQuery}
        onSearchQueryChange={setSearchQuery}
        actorFilter={actorFilter}
        onActorFilterChange={setActorFilter}
        actionFilter={actionFilter}
        onActionFilterChange={setActionFilter}
      />

      <div className="overflow-hidden rounded-xl border">
        <Table>
          <TableHeader className="bg-muted/50 text-xs">
            <TableRow>
              <TableHead className="w-40">เวลาที่บันทึก</TableHead>
              <TableHead className="w-32.5">ประเภทเหตุการณ์</TableHead>
              <TableHead className="w-30">ผู้กระทำ</TableHead>
              <TableHead className="min-w-40">ผู้ดำเนินการ</TableHead>
              <TableHead className="min-w-37.5">Target Entity</TableHead>
              <TableHead className="w-30">IP Address</TableHead>
              <TableHead className="w-17.5 text-center">ดูข้อมูล</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredLogs.length === 0 ? (
              <TableEmptyRow
                title="ไม่พบข้อมูลประวัติบันทึกกิจกรรม"
                description="ไม่พบข้อมูลที่ตรงกับเงื่อนไขการค้นหาหรือฟิลเตอร์ของคุณในปัจจุบัน"
                colSpan={7}
              />
            ) : (
              filteredLogs.map((log) => (
                <TableRow
                  key={log.id}
                  className="hover:bg-muted/40 text-xs transition-colors"
                >
                  <TableCell className="text-muted-foreground font-mono">
                    {log.createdAt}
                  </TableCell>
                  <TableCell>
                    <ActionBadge action={log.action} />
                  </TableCell>
                  <TableCell>
                    <ActorBadge actorType={log.actorType} />
                  </TableCell>
                  <TableCell className="text-foreground font-medium">
                    {log.staffName}
                  </TableCell>
                  <TableCell className="text-muted-foreground font-mono">
                    <span className="text-foreground font-sans font-medium">
                      {log.entity}
                    </span>
                    {log.entityId && (
                      <span className="bg-muted text-muted-foreground ml-1.5 rounded border px-1.5 py-0.5 text-[10px] font-medium">
                        {log.entityId}
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="text-muted-foreground font-mono">
                    {log.ipAddress || '-'}
                  </TableCell>
                  <TableCell className="text-center">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="hover:text-foreground hover:bg-muted text-muted-foreground/70 h-7 w-7 rounded-md"
                      onClick={() => handleOpenDetails(log)}
                    >
                      <IconEye size={14} />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <AuditLogDetailDialog
        isOpen={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        logItem={activeLogItem}
      />
    </div>
  )
}
