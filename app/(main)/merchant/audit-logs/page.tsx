'use client'

import { useState } from 'react'

import { GetActivityLogItem } from '@/actions/analytics/activity-log/actions'
import { useActivityLogs } from '@/actions/analytics/activity-log/hooks'
import { useEmployeePermission } from '@/actions/store/employee/hooks'
import { StorePagination } from '@/app/sites/[domain]/_components/shared/Pagination'
import { MERCHANT_NAVIGATION } from '@/constants/store/navigation'
import { ActorType, LogAction } from '@/generated/prisma/enums'
import { ALL_STORES, useStoreFilter } from '@/stores/merchant/use-store-filter'
import { formatDateTime } from '@/utils/formatting/date'
import {
  IconCheck,
  IconCopy,
  IconEye,
  IconHistory,
  IconLock,
  IconNetwork,
} from '@tabler/icons-react'
import toast from 'react-hot-toast'

import {
  ENTITY_LABEL_TH,
  formatAuditLogSummary,
  LOG_CATEGORIES,
  LogCategory,
} from '@/utils/activity/formatter'
import { StoreSelectField } from '@/components/form/StoreSelectField'
import { PageTabHeader } from '@/components/layout/PageTabHeader'
import { Sidebar } from '@/components/layout/Sidebar'
import { ActionRequiredAlert } from '@/components/shared/ActionRequiredAlert'
import { TableEmptyRow } from '@/components/table/TableEmptyRow'
import { TableLoadingRow } from '@/components/table/TableLoadingRow'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
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
import { AuditLogDetailDialog } from './_components/AuditLogDetailDialog'
import { AuditLogFilters } from './_components/AuditLogFilters'
import { AuditLogStats } from './_components/AuditLogStats'

export default function MerchantAuditLogsPage() {
  const { selectedStoreId } = useStoreFilter()
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [actionFilter, setActionFilter] = useState<string>('all')
  const [actorFilter, setActorFilter] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [page, setPage] = useState(1)
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [activeLogItem, setActiveLogItem] = useState<GetActivityLogItem | null>(
    null,
  )

  const { canViewActivityLogs, isLoading: isPermissionLoading } =
    useEmployeePermission()

  // Actions for category filter if selected
  const categoryActions =
    selectedCategory !== 'all' && LOG_CATEGORIES[selectedCategory as LogCategory]
      ? LOG_CATEGORIES[selectedCategory as LogCategory].actions
      : undefined

  const { data: { data: logs = [], meta } = {}, isLoading } = useActivityLogs({
    storeId: selectedStoreId === ALL_STORES ? '' : selectedStoreId,
    action: actionFilter !== 'all' ? (actionFilter as LogAction) : undefined,
    actions: actionFilter === 'all' ? categoryActions : undefined,
    actorType: actorFilter !== 'all' ? (actorFilter as ActorType) : undefined,
    search: searchQuery.trim() || undefined,
    page,
    limit: 15,
  })

  const handleOpenDetails = (log: GetActivityLogItem) => {
    setActiveLogItem(log)
    setIsDialogOpen(true)
  }

  const handleResetFilters = () => {
    setSelectedCategory('all')
    setActionFilter('all')
    setActorFilter('all')
    setSearchQuery('')
    setPage(1)
  }

  const handleCopyEntityId = (e: React.MouseEvent, id: string) => {
    e.stopPropagation()
    navigator.clipboard.writeText(id)
    setCopiedId(id)
    toast.success('คัดลอกรหัสอ้างอิงแล้ว')
    setTimeout(() => setCopiedId(null), 2000)
  }

  return (
    <Sidebar redirectPath="merchant" items={MERCHANT_NAVIGATION}>
      <PageTabHeader
        icon={IconHistory}
        title="บันทึกประวัติการใช้งาน (Audit Logs)"
        description="ติดตามทุกกิจกรรม การเปลี่ยนแปลงข้อมูล และการเข้าถึงระบบแบบเรียลไทม์ เพื่อความโปร่งใสและมาตรฐานความปลอดภัยระดับองค์กร"
        endContent={<StoreSelectField />}
      />

      {selectedStoreId === ALL_STORES ? (
        <ActionRequiredAlert />
      ) : !isPermissionLoading && !canViewActivityLogs ? (
        <ActionRequiredAlert
          icon={<IconLock />}
          title="ไม่มีสิทธิ์เข้าถึงข้อมูล Audit Logs"
          description="บัญชีของคุณไม่มีสิทธิ์ในการเข้าถึงข้อมูลประวัติกิจกรรมของร้านค้านี้ กรุณาติดต่อผู้ดูแลระบบหรือเจ้าของร้าน"
        />
      ) : (
        <div className="space-y-4">
          {/* SaaS KPI Metric Cards */}
          <AuditLogStats storeId={selectedStoreId} />

          {/* Search & Category Filter Controls */}
          <AuditLogFilters
            searchQuery={searchQuery}
            onSearchQueryChange={(v) => {
              setSearchQuery(v)
              setPage(1)
            }}
            actorFilter={actorFilter}
            onActorFilterChange={(v) => {
              setActorFilter(v)
              setPage(1)
            }}
            actionFilter={actionFilter}
            onActionFilterChange={(v) => {
              setActionFilter(v)
              setPage(1)
            }}
            selectedCategory={selectedCategory}
            onCategoryChange={(cat) => {
              setSelectedCategory(cat)
              setPage(1)
            }}
            totalCount={meta?.totalItems}
            onReset={handleResetFilters}
          />

          {/* Audit Logs Table */}
          <div className="overflow-hidden rounded-xl border bg-card shadow-xs">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40 hover:bg-muted/40">
                  <TableHead className="w-[170px] text-xs font-semibold">
                    วันและเวลา
                  </TableHead>
                  <TableHead className="w-[180px] text-xs font-semibold">
                    ประเภทเหตุการณ์
                  </TableHead>
                  <TableHead className="min-w-[280px] text-xs font-semibold">
                    รายละเอียดกิจกรรม (Action Details)
                  </TableHead>
                  <TableHead className="w-[200px] text-xs font-semibold">
                    ผู้ดำเนินการ (Actor)
                  </TableHead>
                  <TableHead className="w-[130px] text-xs font-semibold">
                    IP Address
                  </TableHead>
                  <TableHead className="w-[70px] text-right text-xs font-semibold">
                    ดูข้อมูล
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(isLoading || isPermissionLoading) && logs.length === 0 ? (
                  <TableLoadingRow colSpan={6} />
                ) : logs.length === 0 ? (
                  <TableEmptyRow
                    title="ไม่พบประวัติกิจกรรม"
                    description="ไม่พบข้อมูลที่ตรงกับตัวกรองหรือคำค้นหาของคุณในขณะนี้"
                    colSpan={6}
                  />
                ) : (
                  logs.map((log) => {
                    const summary = formatAuditLogSummary(log)
                    const entityLabel = ENTITY_LABEL_TH[log.entity] || log.entity
                    const actorName =
                      log.employee?.name ||
                      log.user?.name ||
                      (log.actorType === 'SYSTEM' ? 'ระบบอัตโนมัติ' : 'ผู้ใช้งาน')
                    const actorEmail =
                      log.employee?.email || log.user?.email || null
                    const actorImage = log.user?.image || null

                    return (
                      <TableRow
                        key={log.id}
                        onClick={() => handleOpenDetails(log)}
                        className="cursor-pointer transition-colors hover:bg-muted/50 group"
                      >
                        {/* Timestamp */}
                        <TableCell className="align-top py-3.5">
                          <span className="font-mono text-xs font-medium text-foreground">
                            {formatDateTime(log.createdAt)}
                          </span>
                        </TableCell>

                        {/* Action Badge */}
                        <TableCell className="align-top py-3.5">
                          <ActionBadge action={log.action} />
                        </TableCell>

                        {/* Summary & Entity */}
                        <TableCell className="align-top py-3.5">
                          <div className="space-y-1.5">
                            <p className="text-xs font-medium text-foreground leading-snug group-hover:text-primary transition-colors">
                              {summary}
                            </p>
                            <div className="flex flex-wrap items-center gap-1.5">
                              <Badge
                                variant="secondary"
                                className="text-[10px] font-normal py-0 px-1.5 h-4 bg-muted text-muted-foreground"
                              >
                                {entityLabel}
                              </Badge>
                              {log.entityId && (
                                <div
                                  onClick={(e) =>
                                    handleCopyEntityId(e, log.entityId!)
                                  }
                                  className="inline-flex items-center gap-1 rounded border bg-background px-1.5 py-0 text-[10px] font-mono text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                                  title="คลิกเพื่อคัดลอก Entity ID"
                                >
                                  <span className="max-w-[100px] truncate">
                                    {log.entityId}
                                  </span>
                                  {copiedId === log.entityId ? (
                                    <IconCheck
                                      size={10}
                                      className="text-emerald-500 shrink-0"
                                    />
                                  ) : (
                                    <IconCopy size={10} className="shrink-0 opacity-60" />
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        </TableCell>

                        {/* Actor */}
                        <TableCell className="align-top py-3.5">
                          <div className="flex items-start gap-2">
                            <Avatar className="h-6 w-6 border shrink-0 mt-0.5">
                              {actorImage && (
                                <AvatarImage src={actorImage} alt={actorName} />
                              )}
                              <AvatarFallback className="text-[10px] font-semibold bg-primary/10 text-primary">
                                {actorName.slice(0, 2).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div className="min-w-0 space-y-0.5">
                              <p className="text-xs font-medium text-foreground truncate">
                                {actorName}
                              </p>
                              {actorEmail ? (
                                <p className="text-[10px] text-muted-foreground truncate font-mono">
                                  {actorEmail}
                                </p>
                              ) : (
                                <ActorBadge
                                  actorType={log.actorType}
                                  showIcon={false}
                                  className="text-[9px] py-0 px-1"
                                />
                              )}
                            </div>
                          </div>
                        </TableCell>

                        {/* IP Address */}
                        <TableCell className="align-top py-3.5">
                          {log.ipAddress ? (
                            <div className="inline-flex items-center gap-1 text-[11px] font-mono text-muted-foreground">
                              <IconNetwork size={12} className="opacity-60 shrink-0" />
                              <span>{log.ipAddress}</span>
                            </div>
                          ) : (
                            <span className="text-[11px] text-muted-foreground">-</span>
                          )}
                        </TableCell>

                        {/* Action View Button */}
                        <TableCell className="align-top py-3 text-right">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground group-hover:text-foreground hover:bg-background"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleOpenDetails(log)
                            }}
                            title="เปิดดูรายละเอียดเชิงลึก"
                          >
                            <IconEye size={15} />
                          </Button>
                        </TableCell>
                      </TableRow>
                    )
                  })
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination Controls */}
          {meta && meta.totalPages > 1 && (
            <div className="flex items-center justify-between border-t pt-3">
              <span className="text-xs text-muted-foreground">
                แสดงหน้า {meta.currentPage} จากทั้งหมด {meta.totalPages} หน้า
              </span>
              <StorePagination
                currentPage={meta.currentPage}
                totalPages={meta.totalPages}
                hasNextPage={meta.hasNextPage}
                hasPreviousPage={meta.hasPreviousPage}
                onPageChange={(newPage) => setPage(newPage)}
              />
            </div>
          )}

          {/* Audit Log Detail Dialog / Inspector */}
          <AuditLogDetailDialog
            isOpen={isDialogOpen}
            onOpenChange={setIsDialogOpen}
            logItem={activeLogItem}
          />
        </div>
      )}
    </Sidebar>
  )
}
