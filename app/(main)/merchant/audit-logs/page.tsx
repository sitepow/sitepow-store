'use client'

import { useMemo, useState } from 'react'

import { StorePagination } from '@/app/sites/[domain]/_components/Pagination'
import { MERCHANT_NAVIGATION } from '@/constants/navigation'
import { IconEye, IconHistory } from '@tabler/icons-react'

import { PageTabHeader } from '@/components/PageTabHeader'
import { StoreSelectField } from '@/components/StoreSelectField'
import { TableEmptyRow } from '@/components/TableEmptyRow'
import { DashboardSidebar } from '@/components/layout/DashboardSidebar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
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

export default function MerchantAuditLogsPage() {
  const [selectedStoreId, setSelectedStoreId] = useState<string>('all')
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
    <DashboardSidebar redirectPath="merchant" items={MERCHANT_NAVIGATION}>
      <PageTabHeader
        icon={IconHistory}
        title="ประวัติกิจกรรมระบบ"
        description="ตรวจสอบบันทึก Log การกระทำและเข้าถึงข้อมูลอย่างละเอียด เพื่อความโปร่งใสและการรักษาความปลอดภัยภายในองค์กร"
        endContent={
          <StoreSelectField
            value={selectedStoreId}
            onValueChange={setSelectedStoreId}
          />
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
          <TableHeader>
            <TableRow>
              <TableHead>เวลาที่บันทึก</TableHead>
              <TableHead>ประเภทเหตุการณ์</TableHead>
              <TableHead>ผู้กระทำ</TableHead>
              <TableHead>ผู้ดำเนินการ</TableHead>
              <TableHead>Target Entity</TableHead>
              <TableHead>IP Address</TableHead>
              <TableHead>ดูข้อมูล</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredLogs?.length !== 0 &&
              filteredLogs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell>{log.createdAt}</TableCell>
                  <TableCell>
                    <ActionBadge action={log.action} />
                  </TableCell>
                  <TableCell>
                    <ActorBadge actorType={log.actorType} />
                  </TableCell>
                  <TableCell>{log.staffName}</TableCell>
                  <TableCell className="space-x-2">
                    <span>{log.entity}</span>
                    {log.entityId && (
                      <Badge variant="outline">{log.entityId}</Badge>
                    )}
                  </TableCell>
                  <TableCell>{log.ipAddress || '-'}</TableCell>
                  <TableCell>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleOpenDetails(log)}
                    >
                      <IconEye />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            {filteredLogs?.length === 0 && (
              <TableEmptyRow
                title="ไม่พบข้อมูลประวัติบันทึกกิจกรรม"
                description="ไม่พบข้อมูลที่ตรงกับเงื่อนไขการค้นหาหรือฟิลเตอร์ของคุณในปัจจุบัน"
                colSpan={7}
              />
            )}
          </TableBody>
        </Table>
      </div>
      <StorePagination />
      <AuditLogDetailDialog
        isOpen={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        logItem={activeLogItem}
      />
    </DashboardSidebar>
  )
}
