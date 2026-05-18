'use client'

import { StorePagination } from '@/app/sites/[domain]/_components/Pagination'
import { formatShortDate } from '@/utils/date'
import { IconCalendar, IconHierarchy } from '@tabler/icons-react'

import { TableEmptyRow } from '@/components/TableEmptyRow'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

import { Coupon } from '../page'

interface CouponListTableProps {
  coupons: Coupon[]
  currentStoreBranches: Array<{ id: string; name: string }>
}

export function CouponListTable({
  coupons,
  currentStoreBranches,
}: CouponListTableProps) {
  return (
    <>
      <div className="bg-background overflow-hidden rounded-xl border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>รหัสคูปอง</TableHead>
              <TableHead className="max-w-72 min-w-72">
                รายละเอียด / เงื่อนไข
              </TableHead>
              <TableHead>มูลค่าส่วนลด</TableHead>
              <TableHead>สาขาที่เข้าร่วม</TableHead>
              <TableHead className="w-48">สถิติการใช้งาน</TableHead>
              <TableHead>วันหมดอายุ</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {coupons?.length !== 0 &&
              coupons.map((coupon) => {
                const isLimitless = coupon.usageLimit === null
                const isFull =
                  !isLimitless && coupon.usedCount >= (coupon.usageLimit || 0)
                const targetBranchName = coupon.branchId
                  ? currentStoreBranches.find((b) => b.id === coupon.branchId)
                      ?.name || 'เฉพาะสาขา'
                  : 'ทุกสาขาภายในแบรนด์'

                return (
                  <TableRow key={coupon.id}>
                    <TableCell>
                      <div className="flex flex-col space-y-1">
                        <Badge variant="default" className="w-fit">
                          {coupon.code}
                        </Badge>
                        <span className="text-xs opacity-60">
                          {isFull ? 'สิทธิ์เต็มแล้ว' : 'เปิดใช้งานอยู่'}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="max-w-72 min-w-72">
                      <div className="flex flex-col">
                        <span className="font-medium wrap-break-word whitespace-pre-line">
                          {coupon.description || '-'}
                        </span>
                        <span className="text-muted-foreground text-xs">
                          เมื่อสั่งซื้อขั้นต่ำ ฿
                          {coupon.minOrderAmount.toLocaleString()}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="text-primary font-semibold">
                          {coupon.discountType === 'FIXED_AMOUNT'
                            ? `฿${coupon.discountAmount.toLocaleString()}`
                            : `${coupon.discountAmount}%`}
                        </span>
                        {coupon.discountType === 'PERCENTAGE' &&
                          coupon.maxDiscount && (
                            <span className="text-xs opacity-60">
                              ลดสูงสุด ฿{coupon.maxDiscount.toLocaleString()}
                            </span>
                          )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <IconHierarchy
                          className="shrink-0 opacity-60"
                          size={18}
                        />
                        <span className="text-muted-foreground max-w-45 truncate text-sm">
                          {targetBranchName}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col space-y-1.5">
                        <div className="flex justify-between text-xs">
                          <span className="text-muted-foreground">
                            ใช้ไปแล้ว
                          </span>
                          <span className="font-medium">
                            {coupon.usedCount}{' '}
                            <span className="text-muted-foreground font-normal">
                              {isLimitless
                                ? 'ครั้ง'
                                : `/ ${coupon.usageLimit} ครั้ง`}
                            </span>
                          </span>
                        </div>
                        {!isLimitless && (
                          <Progress
                            value={
                              (coupon.usedCount / (coupon.usageLimit || 1)) *
                              100
                            }
                            className="h-1.5"
                          />
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <IconCalendar
                          className="shrink-0 opacity-60"
                          size={18}
                        />
                        <span className="text-muted-foreground text-sm">
                          {formatShortDate(new Date())}
                        </span>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })}
            {coupons?.length === 0 && (
              <TableEmptyRow
                colSpan={6}
                title="ยังไม่มีโปรโมชันคูปองในขณะนี้"
                description="เริ่มต้นขับเคลื่อนยอดขายด้วยการคลิกปุ่มสร้างคูปองส่วนลด"
              />
            )}
          </TableBody>
        </Table>
      </div>
      <StorePagination />
    </>
  )
}
