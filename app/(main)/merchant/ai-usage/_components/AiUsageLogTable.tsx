'use client'

import { StorePagination } from '@/app/sites/[domain]/_components/Pagination'

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

export interface AiUsageLog {
  id: string
  storeId: string
  storeName: string
  feature: string
  description: string
  status: string
  creditsUsed: number
  timestamp: string
}

interface AiUsageLogTableProps {
  logs: AiUsageLog[]
}

export function AiUsageLogTable({ logs }: AiUsageLogTableProps) {
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
              <TableHead>ผลลัพธ์</TableHead>
              <TableHead className="text-right">เครดิตที่ใช้</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {logs?.length !== 0 &&
              logs.map((log) => {
                const isSuccess = log.status === 'SUCCESS'

                return (
                  <TableRow key={log.id}>
                    <TableCell>
                      <span className="text-sm opacity-60">
                        {log.timestamp}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="font-medium">{log.storeName}</span>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{log.feature}</Badge>
                    </TableCell>
                    <TableCell className="max-w-72 min-w-72">
                      <span className="text-muted-foreground text-sm wrap-break-word whitespace-pre-line">
                        {log.description}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge variant={isSuccess ? 'default' : 'secondary'}>
                        {isSuccess ? 'สำเร็จ' : 'ล้มเหลว'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {log.creditsUsed > 0 ? `-${log.creditsUsed}` : '0'}
                    </TableCell>
                  </TableRow>
                )
              })}
            {logs?.length === 0 && (
              <TableEmptyRow
                colSpan={6}
                title="ไม่พบบันทึกข้อมูลประวัติกิจกรรม AI ของร้านค้าที่คุณเลือก"
              />
            )}
          </TableBody>
        </Table>
      </div>
      {/* <StorePagination /> */}
    </>
  )
}
