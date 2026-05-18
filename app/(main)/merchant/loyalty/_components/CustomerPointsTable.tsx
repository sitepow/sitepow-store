'use client'

import { ComponentProps } from 'react'

import { StorePagination } from '@/app/sites/[domain]/_components/Pagination'
import { IconHistory, IconSearch } from '@tabler/icons-react'

import { TableEmptyRow } from '@/components/TableEmptyRow'
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

interface Customer {
  id: string
  name: string
  phone: string
  currentPoints: number
  totalEarned: number
  lastActive: string
}

interface CustomerPointsTableProps extends ComponentProps<typeof Card> {
  customers: Customer[]
  isEnabled: boolean
  searchTerm: string
  onSearchChange: (value: string) => void
}

export function CustomerPointsTable({
  customers,
  isEnabled,
  searchTerm,
  onSearchChange,
  className,
  ...props
}: CustomerPointsTableProps) {
  return (
    <Card className={cn('h-fit', className)} {...props}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          ฐานข้อมูลสมาชิกและคะแนนคงเหลือ
        </CardTitle>
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
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9 text-xs"
            disabled={!isEnabled}
          />
        </div>
        <div className="bg-background overflow-hidden rounded-xl border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>รหัสสมาชิก</TableHead>
                <TableHead>ชื่อลูกค้า</TableHead>
                <TableHead>เบอร์โทรศัพท์</TableHead>
                <TableHead className="text-right">แต้มปัจจุบัน</TableHead>
                <TableHead className="text-right">แต้มสะสมทั้งหมด</TableHead>
                <TableHead className="text-right">จัดการ</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {!isEnabled ? (
                <TableEmptyRow
                  title="ระบบแต้มสะสมของร้านค้านี้ถูกปิดการใช้งานอยู่"
                  colSpan={6}
                />
              ) : customers.length === 0 ? (
                <TableEmptyRow
                  title="ไม่พบข้อมูลสมาชิกในระบบของแบรนด์นี้"
                  colSpan={6}
                />
              ) : (
                customers.map((customer) => (
                  <TableRow key={customer.id}>
                    <TableCell className="text-xs font-medium">
                      {customer.id}
                    </TableCell>
                    <TableCell className="font-medium">
                      {customer.name}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-xs">
                      {customer.phone}
                    </TableCell>
                    <TableCell className="text-primary text-right font-semibold">
                      {customer.currentPoints.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-right text-xs">
                      {customer.totalEarned.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-muted-foreground hover:text-foreground h-7 gap-1 text-[11px]"
                      >
                        <IconHistory size={12} /> ประวัติการใช้
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
        <StorePagination />
      </CardContent>
    </Card>
  )
}
