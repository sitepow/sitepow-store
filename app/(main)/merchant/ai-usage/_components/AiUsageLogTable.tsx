'use client'

import { useState } from 'react'

import { useAiLogs } from '@/actions/hooks/ai-usage'
import { StorePagination } from '@/app/sites/[domain]/_components/Pagination'
import { useSession } from '@/hooks/use-session'
import { ALL_STORES, useStoreFilter } from '@/stores/use-store-filter'
import { formatDate } from '@/utils/date'

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

export function AiUsageLogTable() {
  const { userId: ownerId } = useSession()

  const { selectedStoreId } = useStoreFilter()
  const storeId = selectedStoreId === ALL_STORES ? undefined : selectedStoreId

  const [page, setPage] = useState(1)

  const { data, isLoading } = useAiLogs({ ownerId: ownerId!, storeId, page })
  const logs = data?.data ?? []
  const meta = data?.meta

  return (
    <>
      <div className="overflow-hidden rounded-xl border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>เวลาทำรายการ</TableHead>
              <TableHead>สำหรับร้านค้า</TableHead>
              <TableHead>ฟีเจอร์ AI</TableHead>
              <TableHead className="max-w-75">รายละเอียดคำสั่งงาน</TableHead>
              <TableHead className="text-right">เครดิตที่ใช้</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && <TableLoadingRow colSpan={5} />}

            {!isLoading && logs.length === 0 && (
              <TableEmptyRow
                colSpan={5}
                title="ไม่พบบันทึกข้อมูลประวัติกิจกรรม AI ของร้านค้าที่คุณเลือก"
              />
            )}

            {!isLoading &&
              logs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell>
                    <span className="text-sm opacity-60">
                      {formatDate(new Date(log.createdAt))}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="font-medium">{log.store.name}</span>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{log.action}</Badge>
                  </TableCell>
                  <TableCell className="max-w-72 min-w-72">
                    <span className="text-muted-foreground text-sm wrap-break-word whitespace-pre-line">
                      {log.prompt}
                    </span>
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {log.cost > 0 ? `-${log.cost}` : '0'}
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </div>

      {meta && meta.totalPages > 1 && (
        <StorePagination
          currentPage={meta.currentPage}
          totalPages={meta.totalPages}
          hasNextPage={meta.hasNextPage}
          hasPreviousPage={meta.hasPreviousPage}
          onPageChange={setPage}
        />
      )}
    </>
  )
}
