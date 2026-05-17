'use client'

import { useState } from 'react'

import { getLabel } from '@/constants/translate'
import {
  IconAlertCircle,
  IconCpu,
  IconEye,
  IconFilter,
  IconHistory,
  IconSearch,
  IconTerminal,
  IconUser,
} from '@tabler/icons-react'

import { PageTabHeader } from '@/components/PageTabHeader'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
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

type LogAction =
  | 'LOGIN'
  | 'LOGOUT'
  | 'UPDATE_STOCK'
  | 'MANAGE_STAFF'
  | 'CREATE_ORDER'
  | 'DELETE_PRODUCT'

type ActorType = 'SYSTEM' | 'MERCHANT' | 'SUPER_ADMIN'

interface ActivityLogItem {
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

  const [activeLogItem, setActiveLogItem] = useState<ActivityLogItem | null>(
    null,
  )

  let filteredLogs = MOCK_ACTIVITY_LOGS.filter(
    (log) => log.storeId === selectedStoreId,
  )

  if (actionFilter !== 'all') {
    filteredLogs = filteredLogs.filter((log) => log.action === actionFilter)
  }

  if (actorFilter !== 'all') {
    filteredLogs = filteredLogs.filter((log) => log.actorType === actorFilter)
  }

  if (searchQuery) {
    const targetQuery = searchQuery.toLowerCase()
    filteredLogs = filteredLogs.filter(
      (log) =>
        log.entityId.toLowerCase().includes(targetQuery) ||
        log.staffName.toLowerCase().includes(targetQuery) ||
        log.entity.toLowerCase().includes(targetQuery),
    )
  }

  const renderActionBadge = (action: LogAction) => {
    switch (action) {
      case 'UPDATE_STOCK':
        return (
          <Badge
            variant="outline"
            className="px-2 py-0.5 text-[11px] font-medium"
          >
            อัปเดตสต็อก
          </Badge>
        )
      case 'MANAGE_STAFF':
        return (
          <Badge
            variant="outline"
            className="px-2 py-0.5 text-[11px] font-medium"
          >
            จัดการสิทธิ์
          </Badge>
        )
      case 'DELETE_PRODUCT':
        return (
          <Badge
            variant="outline"
            className="px-2 py-0.5 text-[11px] font-medium"
          >
            ลบสินค้า
          </Badge>
        )
      case 'CREATE_ORDER':
        return (
          <Badge
            variant="outline"
            className="px-2 py-0.5 text-[11px] font-medium"
          >
            สร้างออเดอร์
          </Badge>
        )
      default:
        return (
          <Badge
            variant="secondary"
            className="px-2 py-0.5 text-[11px] font-medium"
          >
            กิจกรรมทั่วไป
          </Badge>
        )
    }
  }

  return (
    <div className="space-y-6">
      <PageTabHeader
        icon={IconHistory}
        title="ประวัติกิจกรรมระบบ"
        description="ตรวจสอบบันทึก Log การกระทำและเข้าถึงข้อมูลอย่างละเอียด เพื่อความโปร่งใสและการรักษาความปลอดภัยภายในองค์กร"
        endContent={
          <Select value={selectedStoreId} onValueChange={setSelectedStoreId}>
            <SelectTrigger className="bg-background w-full shadow-sm lg:w-60">
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
        }
      />

      <Card className="bg-muted/40 border">
        <CardContent className="grid grid-cols-1 gap-4 p-4 text-xs sm:grid-cols-3">
          <div className="space-y-1.5">
            <label className="text-muted-foreground flex items-center gap-1 font-medium">
              <IconSearch size={14} /> ค้นหาพนักงาน / Entity ID
            </label>
            <Input
              placeholder="พิมพ์ค้นหาชื่อ, รหัสเป้าหมาย..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-background h-9 text-xs"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-muted-foreground flex items-center gap-1 font-medium">
              <IconFilter size={14} /> กรองผู้ดำเนินการ (Actor Group)
            </label>
            <Select value={actorFilter} onValueChange={setActorFilter}>
              <SelectTrigger className="bg-background h-9">
                <SelectValue placeholder="ทั้งหมดทุกประเภท" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">ทั้งหมดทุกประเภท</SelectItem>
                <SelectItem value="MERCHANT">
                  Merchant (เจ้าของร้าน / พนักงาน)
                </SelectItem>
                <SelectItem value="SYSTEM">
                  System (ระบบอัตโนมัติ / AI)
                </SelectItem>
                <SelectItem value="SUPER_ADMIN">
                  Super Admin (ทีมผู้ดูแลระบบกลาง)
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <label className="text-muted-foreground flex items-center gap-1 font-medium">
              <IconFilter size={14} /> กรองตามประเภทเหตุการณ์ (Action)
            </label>
            <Select value={actionFilter} onValueChange={setActionFilter}>
              <SelectTrigger className="bg-background h-9">
                <SelectValue placeholder="ทุกเหตุการณ์" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">ทุกเหตุการณ์</SelectItem>
                <SelectItem value="UPDATE_STOCK">
                  การจัดการคลังสต็อก (UPDATE_STOCK)
                </SelectItem>
                <SelectItem value="MANAGE_STAFF">
                  การตั้งค่าสิทธิ์พนักงาน (MANAGE_STAFF)
                </SelectItem>
                <SelectItem value="CREATE_ORDER">
                  การออกออเดอร์ใหม่ (CREATE_ORDER)
                </SelectItem>
                <SelectItem value="DELETE_PRODUCT">
                  การลบข้อมูลสินค้าออกจากระบบ (DELETE_PRODUCT)
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <div className="bg-background overflow-hidden rounded-md border shadow-sm">
        <div className="overflow-x-auto">
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
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="text-muted-foreground py-14 text-center text-xs"
                  >
                    <div className="flex flex-col items-center justify-center gap-2">
                      <IconAlertCircle
                        size={26}
                        className="text-muted-foreground/40"
                      />
                      <span className="text-foreground mt-1 font-semibold">
                        ไม่พบข้อมูลประวัติบันทึกกิจกรรม
                      </span>
                      <span className="text-muted-foreground text-[11px]">
                        ไม่พบข้อมูลที่ตรงกับเงื่อนไขการค้นหาหรือฟิลเตอร์ของคุณในปัจจุบัน
                      </span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredLogs.map((log) => (
                  <TableRow
                    key={log.id}
                    className="hover:bg-muted/40 text-xs transition-colors"
                  >
                    <TableCell className="text-muted-foreground font-mono">
                      {log.createdAt}
                    </TableCell>
                    <TableCell>{renderActionBadge(log.action)}</TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className="bg-background text-foreground gap-1 px-1.5 py-0.5 text-[10px] font-medium shadow-none select-none"
                      >
                        {log.actorType === 'SYSTEM' ? (
                          <IconCpu size={10} />
                        ) : (
                          <IconUser size={10} />
                        )}
                        {typeof getLabel?.actorType === 'function'
                          ? getLabel.actorType(log.actorType)
                          : log.actorType}
                      </Badge>
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
                      <Dialog
                        onOpenChange={(isOpen) => {
                          if (isOpen) setActiveLogItem(log)
                        }}
                      >
                        <DialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="hover:text-foreground hover:bg-muted text-muted-foreground/70 h-7 w-7 rounded-md"
                          >
                            <IconEye size={14} />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-md p-6">
                          <DialogHeader>
                            <DialogTitle className="text-foreground flex items-center gap-1.5 text-sm font-semibold">
                              <IconTerminal
                                size={18}
                                className="text-muted-foreground"
                              />
                              ข้อมูลโครงสร้างกิจกรรมเชิงลึก (Metadata)
                            </DialogTitle>
                            <DialogDescription className="text-xs">
                              ชุดข้อมูลดิบ (Payload Details) ในรูปแบบ JSON
                              ที่ระบบหลังบ้านบันทึกเก็บไว้ขณะเกิดรายการนี้
                            </DialogDescription>
                          </DialogHeader>

                          <div className="bg-muted text-foreground max-h-90 overflow-x-auto rounded-md border p-4 font-mono text-[11px] leading-relaxed">
                            <pre>
                              {JSON.stringify(
                                activeLogItem?.details || {
                                  message: 'ไม่มีข้อมูลรายละเอียดเพิ่มเติม',
                                },
                                null,
                                2,
                              )}
                            </pre>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  )
}
