'use client'

import { useStoreAiCredits } from '@/actions/hooks/ai-usage'
import { Plan } from '@/generated/prisma/enums'
import { useSession } from '@/hooks/use-session'
import { ALL_STORES, useStoreFilter } from '@/stores/use-store-filter'
import { formatDate } from '@/utils/date'
import { IconAlertTriangle } from '@tabler/icons-react'

import { TableEmptyRow } from '@/components/TableEmptyRow'
import { TableLoadingRow } from '@/components/TableLoadingRow'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

export function StoreAiCreditTable() {
  const { userId } = useSession()

  const { selectedStoreId } = useStoreFilter()
  const storeId = selectedStoreId === ALL_STORES ? undefined : selectedStoreId

  const { data: stores = [], isLoading } = useStoreAiCredits(userId!, storeId)

  return (
    <div className="overflow-hidden rounded-xl border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ชื่อร้านค้า</TableHead>
            <TableHead>แพ็กเกจ</TableHead>
            <TableHead>AI Vision (ตรวจสลิป)</TableHead>
            <TableHead>AI Search (ค้นด้วยภาพ)</TableHead>
            <TableHead>รอบรีเซ็ตถัดไป</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading && <TableLoadingRow colSpan={5} />}

          {!isLoading && stores.length === 0 && (
            <TableEmptyRow colSpan={5} title="ไม่พบข้อมูลเครดิตร้านค้า" />
          )}

          {!isLoading &&
            stores.map((store) => {
              const isStarter = store.plan === Plan.STARTER

              const visionUsed = store.usage?.aiVisionUsed ?? 0
              const visionTotal = store.aiVisionCredits
              const searchUsed = store.usage?.aiSearchUsed ?? 0
              const searchTotal = store.aiSearchCredits

              const visionPercent =
                visionTotal > 0 ? (visionUsed / visionTotal) * 100 : 0
              const searchPercent =
                searchTotal > 0 ? (searchUsed / searchTotal) * 100 : 0

              const isVisionCritical = visionPercent > 85
              const isSearchCritical = searchPercent > 85

              const resetDate = store.usage?.lastResetDate
                ? formatDate(new Date(store.usage.lastResetDate))
                : '-'

              return (
                <TableRow key={store.id}>
                  <TableCell>
                    <span className="font-medium">{store.name}</span>
                  </TableCell>
                  <TableCell>
                    <Badge>{store.plan}</Badge>
                  </TableCell>
                  <TableCell>
                    {isStarter ? (
                      <span className="opacity-60">-</span>
                    ) : (
                      <div className="flex flex-col">
                        <div className="flex items-center gap-1">
                          <span
                            className={
                              isVisionCritical
                                ? 'font-semibold text-amber-600 dark:text-amber-400'
                                : 'font-medium'
                            }
                          >
                            {visionUsed.toLocaleString()}
                          </span>
                          <span className="text-muted-foreground">
                            /{visionTotal.toLocaleString()}
                          </span>
                          {isVisionCritical && (
                            <IconAlertTriangle
                              size={16}
                              className="shrink-0 text-amber-500"
                            />
                          )}
                        </div>
                        <span className="text-xs opacity-60">
                          เหลือ {(visionTotal - visionUsed).toLocaleString()}{' '}
                          ครั้ง
                        </span>
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    {isStarter ? (
                      <span className="opacity-60">-</span>
                    ) : (
                      <div className="flex flex-col">
                        <div className="flex items-center gap-1">
                          <span
                            className={
                              isSearchCritical
                                ? 'font-semibold text-amber-600 dark:text-amber-400'
                                : 'font-medium'
                            }
                          >
                            {searchUsed.toLocaleString()}
                          </span>
                          <span className="text-muted-foreground">
                            /{searchTotal.toLocaleString()}
                          </span>
                          {isSearchCritical && (
                            <IconAlertTriangle
                              size={16}
                              className="shrink-0 text-amber-500"
                            />
                          )}
                        </div>
                        <span className="text-xs opacity-60">
                          เหลือ {(searchTotal - searchUsed).toLocaleString()}{' '}
                          ครั้ง
                        </span>
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <span className={isStarter ? 'opacity-60' : ''}>
                      {resetDate}
                    </span>
                  </TableCell>
                </TableRow>
              )
            })}
        </TableBody>
      </Table>
    </div>
  )
}
