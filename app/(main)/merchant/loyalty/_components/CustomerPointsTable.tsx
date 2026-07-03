'use client'

import { ComponentProps, useState } from 'react'

import { useCustomerPoints, useLoyaltySettings } from '@/actions/hooks/loyalty'
import { StorePagination } from '@/app/sites/[domain]/_components/Pagination'
import { useStoreFilter } from '@/stores/use-store-filter'
import { IconHistory, IconSearch } from '@tabler/icons-react'

import { TableEmptyRow } from '@/components/TableEmptyRow'
import { TableLoadingRow } from '@/components/TableLoadingRow'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

import { cn } from '@/lib/utils'

export function CustomerPointsTable({
  className,
  ...props
}: ComponentProps<typeof Card>) {
  const { selectedStoreId } = useStoreFilter()
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')

  const { data: settings } = useLoyaltySettings(selectedStoreId)
  const { data: { data: customers = [], meta } = {}, isLoading } =
    useCustomerPoints({
      storeId: selectedStoreId,
      page,
      limit: 10,
      search,
    })

  const isEnabled = settings?.isPointsEnabled ?? false

  return (
    <Card className={cn('h-fit', className)} {...props}>
      <CardHeader>
        <CardTitle>ฐานข้อมูลสมาชิกและคะแนนคงเหลือ</CardTitle>
        <CardDescription>
          รายชื่อลูกค้าที่เป็นสมาชิกของร้านค้านี้ และประวัติคะแนนสะสม
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="relative">
          <IconSearch
            className="text-muted-foreground absolute top-2.5 left-2.5"
            size={16}
          />
          <Input
            placeholder="ค้นหาสมาชิกด้วยชื่อ หรือเบอร์โทรศัพท์..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setPage(1)
            }}
            className="pl-9 text-xs"
            disabled={!isEnabled}
          />
        </div>
        <div className="bg-background overflow-hidden rounded-xl border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ชื่อลูกค้า</TableHead>
                <TableHead>เบอร์โทรศัพท์</TableHead>
                <TableHead className="text-right">แต้มปัจจุบัน</TableHead>
                <TableHead className="text-right">ยอดซื้อสะสม</TableHead>
                <TableHead className="text-right">จัดการ</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {!isEnabled ? (
                <TableEmptyRow
                  title="ระบบแต้มสะสมของร้านค้านี้ถูกปิดการใช้งานอยู่"
                  colSpan={5}
                />
              ) : isLoading && customers.length === 0 ? (
                <TableLoadingRow colSpan={5} />
              ) : customers.length === 0 ? (
                <TableEmptyRow
                  title="ไม่พบข้อมูลสมาชิกในระบบของแบรนด์นี้"
                  colSpan={5}
                />
              ) : (
                customers.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="max-w-72 min-w-72 wrap-break-word whitespace-pre-line">
                      {[item.customer.firstName, item.customer.lastName]
                        .filter(Boolean)
                        .join(' ') || item.customer.email}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-xs">
                      {item.customer.phone ?? '-'}
                    </TableCell>
                    <TableCell className="text-primary text-right font-semibold">
                      {item.rewardPoints.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-right">
                      ฿{Number(item.totalSpent).toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="outline" size="icon-lg">
                        <IconHistory />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
        {meta && meta.totalPages > 1 && (
          <StorePagination
            currentPage={meta.currentPage}
            totalPages={meta.totalPages}
            hasNextPage={meta.hasNextPage}
            hasPreviousPage={meta.hasPreviousPage}
            onPageChange={(newPage) => setPage(newPage)}
          />
        )}
      </CardContent>
    </Card>
  )
}
