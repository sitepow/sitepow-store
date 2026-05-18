'use client'

import { IconAlertTriangle } from '@tabler/icons-react'

import { TableEmptyRow } from '@/components/TableEmptyRow'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

export interface StoreAiCredit {
  id: string
  name: string
  plan: string
  visionCredits: { used: number; total: number }
  searchCredits: { used: number; total: number }
  resetDate: string
}

interface StoreAiCreditTableProps {
  stores: StoreAiCredit[]
}

export function StoreAiCreditTable({ stores }: StoreAiCreditTableProps) {
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
          {stores?.length !== 0 &&
            stores.map((store) => {
              const isStarter = store.plan === 'Starter Plan'

              const visionPercent =
                store.visionCredits.total > 0
                  ? (store.visionCredits.used / store.visionCredits.total) * 100
                  : 0
              const searchPercent =
                store.searchCredits.total > 0
                  ? (store.searchCredits.used / store.searchCredits.total) * 100
                  : 0

              const isVisionCritical = visionPercent > 85
              const isSearchCritical = searchPercent > 85

              return (
                <TableRow key={store.id}>
                  <TableCell>
                    <span className="font-medium">{store.name}</span>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{store.plan}</Badge>
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
                            {store.visionCredits.used.toLocaleString()}
                          </span>
                          <span className="text-muted-foreground">
                            /{store.visionCredits.total.toLocaleString()}
                          </span>
                          {isVisionCritical && (
                            <IconAlertTriangle
                              size={16}
                              className="shrink-0 text-amber-500"
                            />
                          )}
                        </div>
                        <span className="text-xs opacity-60">
                          เหลือ{' '}
                          {(
                            store.visionCredits.total - store.visionCredits.used
                          ).toLocaleString()}{' '}
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
                            {store.searchCredits.used.toLocaleString()}
                          </span>
                          <span className="text-muted-foreground">
                            /{store.searchCredits.total.toLocaleString()}
                          </span>
                          {isSearchCritical && (
                            <IconAlertTriangle
                              size={16}
                              className="shrink-0 text-amber-500"
                            />
                          )}
                        </div>
                        <span className="text-xs opacity-60">
                          เหลือ{' '}
                          {(
                            store.searchCredits.total - store.searchCredits.used
                          ).toLocaleString()}{' '}
                          ครั้ง
                        </span>
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <span className={isStarter ? 'opacity-60' : ''}>
                      {store.resetDate}
                    </span>
                  </TableCell>
                </TableRow>
              )
            })}
          {stores?.length === 0 && (
            <TableEmptyRow colSpan={5} title="ไม่พบข้อมูลเครดิตร้านค้า" />
          )}
        </TableBody>
      </Table>
    </div>
  )
}
