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
import { IconEye, IconHistory, IconLock } from '@tabler/icons-react'

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

  const [open, setOpen] = useState(false)
  const [activeLogItem, setActiveLogItem] = useState<GetActivityLogItem | null>(
    null,
  )

  const { canViewActivityLogs, isLoading: isPermissionLoading } =
    useEmployeePermission()

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
    limit: 10,
  })

  const handleOpenDetails = (log: GetActivityLogItem) => {
    setActiveLogItem(log)
    setOpen(true)
  }

  const handleResetFilters = () => {
    setSelectedCategory('all')
    setActionFilter('all')
    setActorFilter('all')
    setSearchQuery('')
    setPage(1)
  }

  return (
    <Sidebar redirectPath="merchant" items={MERCHANT_NAVIGATION}>
      <PageTabHeader
        icon={IconHistory}
        title="บันทึกประวัติการใช้งาน"
        description="ติดตามทุกกิจกรรม การเปลี่ยนแปลงข้อมูล และการเข้าถึงระบบเพื่อความโปร่งใสและตรวจสอบได้"
        endContent={<StoreSelectField />}
      />

      {selectedStoreId === ALL_STORES ? (
        <ActionRequiredAlert />
      ) : !isPermissionLoading && !canViewActivityLogs ? (
        <ActionRequiredAlert
          icon={<IconLock />}
          title="ไม่มีสิทธิ์เข้าถึง"
          description="คุณไม่มีสิทธิ์ในการเข้าถึงข้อมูลประวัติกิจกรรมของร้านค้านี้"
        />
      ) : (
        <div className="space-y-6">
          <AuditLogStats storeId={selectedStoreId} />

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
            onReset={handleResetFilters}
          />

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>วันและเวลา</TableHead>
                  <TableHead>ประเภทเหตุการณ์</TableHead>
                  <TableHead>รายละเอียดกิจกรรม</TableHead>
                  <TableHead>ผู้ดำเนินการ</TableHead>
                  <TableHead>IP Address</TableHead>
                  <TableHead className="text-right">จัดการ</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(isLoading || isPermissionLoading) && logs.length === 0 ? (
                  <TableLoadingRow colSpan={6} />
                ) : logs.length === 0 ? (
                  <TableEmptyRow
                    title="ยังไม่มีประวัติกิจกรรม"
                    description="ไม่พบข้อมูลที่ตรงกับตัวกรองหรือคำค้นหาของคุณในขณะนี้"
                    colSpan={6}
                  />
                ) : (
                  logs.map((log) => {
                    const summary = formatAuditLogSummary(log)
                    const entityLabel =
                      ENTITY_LABEL_TH[log.entity] || log.entity
                    const actorName =
                      log.employee?.name ||
                      log.user?.name ||
                      (log.actorType === 'SYSTEM'
                        ? 'ระบบอัตโนมัติ'
                        : 'ผู้ใช้งาน')
                    const actorEmail =
                      log.employee?.email || log.user?.email || null
                    const actorImage = log.user?.image || null

                    return (
                      <TableRow key={log.id}>
                        <TableCell className="whitespace-nowrap">
                          {formatDateTime(log.createdAt)}
                        </TableCell>

                        <TableCell className="whitespace-nowrap">
                          <ActionBadge action={log.action} />
                        </TableCell>

                        <TableCell className="max-w-md">
                          <div className="flex flex-col gap-1">
                            <span className="text-sm font-medium leading-snug">
                              {summary}
                            </span>
                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                              <Badge
                                variant="secondary"
                                className="px-1.5 py-0 text-[10px] font-normal"
                              >
                                {entityLabel}
                              </Badge>
                              {log.entityId && (
                                <span className=" text-[11px] opacity-75">
                                  #{log.entityId}
                                </span>
                              )}
                            </div>
                          </div>
                        </TableCell>

                        <TableCell className="whitespace-nowrap">
                          <div className="flex items-center gap-2.5">
                            <Avatar className="size-7">
                              {actorImage && (
                                <AvatarImage
                                  src={actorImage}
                                  alt={actorName}
                                />
                              )}
                              <AvatarFallback className="bg-muted text-muted-foreground text-xs">
                                {actorName.slice(0, 2).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex flex-col">
                              <span className="text-sm font-medium">
                                {actorName}
                              </span>
                              {actorEmail ? (
                                <span className="text-xs text-muted-foreground">
                                  {actorEmail}
                                </span>
                              ) : (
                                <ActorBadge
                                  actorType={log.actorType}
                                  className="w-fit text-[10px] px-1 py-0"
                                />
                              )}
                            </div>
                          </div>
                        </TableCell>

                        <TableCell className="whitespace-nowrap  text-xs">
                          {log.ipAddress || '-'}
                        </TableCell>

                        <TableCell className="text-right whitespace-nowrap">
                          <Button
                            variant="outline"
                            size="icon-lg"
                            onClick={() => handleOpenDetails(log)}
                          >
                            <IconEye />
                          </Button>
                        </TableCell>
                      </TableRow>
                    )
                  })
                )}
              </TableBody>
            </Table>
          </div>

          {meta && meta.totalPages > 1 && (
            <div className="mt-4 flex items-center justify-between">
              <span className="text-muted-foreground text-xs">
                แสดงหน้า {meta.currentPage} จากทั้งหมด {meta.totalPages} หน้า
                ({meta.totalItems.toLocaleString()} รายการ)
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

          <AuditLogDetailDialog
            logItem={activeLogItem}
            open={open}
            setOpen={setOpen}
          />
        </div>
      )}
    </Sidebar>
  )
}
