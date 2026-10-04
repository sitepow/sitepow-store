'use client'

import { useState } from 'react'

import { useCoupons, useDeleteCoupon } from '@/actions/sales/coupon/hooks'
import { StorePagination } from '@/app/sites/[domain]/_components/shared/Pagination'
import { useStoreFilter } from '@/stores/use-store-filter'
import { formatShortDate } from '@/utils/formatting/date'
import { IconCalendar, IconHierarchy } from '@tabler/icons-react'

import { DeleteButton } from '@/components/shared/DeleteButton'
import { TableEmptyRow } from '@/components/table/TableEmptyRow'
import { TableLoadingRow } from '@/components/table/TableLoadingRow'
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

export function CouponListTable() {
  const { selectedStoreId } = useStoreFilter()
  const [page, setPage] = useState(1)

  const { data: { data: coupons = [], meta } = {}, isLoading } = useCoupons({
    storeId: selectedStoreId,
    page,
    limit: 10,
  })

  const deleteCouponMutation = useDeleteCoupon()

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
              <TableHead className="text-right">จัดการ</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && coupons.length === 0 ? (
              <TableLoadingRow colSpan={7} />
            ) : coupons.length === 0 ? (
              <TableEmptyRow
                colSpan={7}
                title="ยังไม่มีโปรโมชันคูปองในขณะนี้"
                description="เริ่มต้นขับเคลื่อนยอดขายด้วยการคลิกปุ่มสร้างคูปองส่วนลด"
              />
            ) : (
              coupons.map((coupon) => {
                const isLimitless = coupon.usageLimit === null
                const isFull =
                  !isLimitless && coupon.usedCount >= (coupon.usageLimit ?? 0)

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
                          {Number(coupon.minOrderAmount).toLocaleString()}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="text-primary font-semibold">
                          {coupon.discountType === 'FIXED'
                            ? `฿${Number(coupon.discountAmount).toLocaleString()}`
                            : `${Number(coupon.discountAmount)}%`}
                        </span>
                        {coupon.discountType === 'PERCENTAGE' &&
                          coupon.maxDiscount && (
                            <span className="text-xs opacity-60">
                              ลดสูงสุด ฿
                              {Number(coupon.maxDiscount).toLocaleString()}
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
                          {coupon.branch?.name ?? 'ทุกสาขาภายในแบรนด์'}
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
                              (coupon.usedCount / (coupon.usageLimit ?? 1)) *
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
                          {formatShortDate(new Date(coupon.endDate))}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <DeleteButton
                        isPending={deleteCouponMutation.isPending}
                        onDelete={() => deleteCouponMutation.mutate(coupon.id)}
                      />
                    </TableCell>
                  </TableRow>
                )
              })
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
    </>
  )
}
