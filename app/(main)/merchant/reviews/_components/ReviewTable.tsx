'use client'

import { useState } from 'react'

import { useEmployeePermission } from '@/actions/hooks/employee'
import { useDeleteReview, useReviews } from '@/actions/hooks/review'
import { StorePagination } from '@/app/sites/[domain]/_components/Pagination'
import { ALL_STORES, useStoreFilter } from '@/stores/use-store-filter'
import { formatDateTime } from '@/utils/date'
import { IconLock, IconStarFilled, IconTrash } from '@tabler/icons-react'

import { ActionRequiredAlert } from '@/components/ActionRequiredAlert'
import { DeleteButton } from '@/components/DeleteButton'
import { TableEmptyRow } from '@/components/TableEmptyRow'
import { TableLoadingRow } from '@/components/TableLoadingRow'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

export function ReviewTable() {
  const { selectedStoreId } = useStoreFilter()
  const [page, setPage] = useState(1)

  const {
    canViewReviews,
    canDeleteReviews,
    isLoading: isPermissionLoading,
  } = useEmployeePermission()

  const deleteMutation = useDeleteReview()
  const { data: { data: reviews = [], meta } = {}, isLoading } = useReviews({
    storeId: selectedStoreId,
    page,
    limit: 10,
  })

  if (selectedStoreId === ALL_STORES) {
    return <ActionRequiredAlert />
  }

  if (!isPermissionLoading && !canViewReviews) {
    return (
      <ActionRequiredAlert
        icon={<IconLock />}
        title="ไม่มีสิทธิ์เข้าถึง"
        description="คุณไม่มีสิทธิ์ในการดูข้อมูลรีวิวของสาขาหรือร้านค้านี้"
      />
    )
  }

  const showManageColumn = canDeleteReviews
  const totalColumns = showManageColumn ? 6 : 5

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>วันที่</TableHead>
              <TableHead>สินค้า</TableHead>
              <TableHead>ลูกค้า</TableHead>
              <TableHead>คะแนน</TableHead>
              <TableHead>ความคิดเห็น</TableHead>
              {showManageColumn && <TableHead>จัดการ</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {(isLoading || isPermissionLoading) && reviews.length === 0 ? (
              <TableLoadingRow colSpan={totalColumns} />
            ) : reviews.length === 0 ? (
              <TableEmptyRow
                colSpan={totalColumns}
                title="ยังไม่มีข้อมูลรีวิวในร้านค้านี้"
              />
            ) : (
              reviews.map((item: any) => (
                <TableRow key={item.id}>
                  <TableCell>{formatDateTime(new Date(item.date))}</TableCell>
                  <TableCell>
                    <div>{item.product?.title || '-'}</div>
                    {item.variant?.title && (
                      <div>ตัวเลือก: {item.variant.title}</div>
                    )}
                  </TableCell>
                  <TableCell>
                    <div>
                      {[item.customer?.firstName, item.customer?.lastName]
                        .filter(Boolean)
                        .join(' ') || 'ลูกค้าไม่ระบุชื่อ'}
                    </div>
                    <div>{item.customer?.email || '-'}</div>
                  </TableCell>
                  <TableCell>
                    <div>
                      {item.rating}
                      <IconStarFilled />
                    </div>
                  </TableCell>
                  <TableCell>
                    <p>{item.comment}</p>
                    {item.images && item.images.length > 0 && (
                      <div>
                        {item.images.map((img: string, idx: number) => (
                          <div key={idx}>
                            <img src={img} alt="Review" />
                          </div>
                        ))}
                      </div>
                    )}
                  </TableCell>
                  {showManageColumn && (
                    <TableCell>
                      <DeleteButton
                        isPending={deleteMutation.isPending}
                        icon={<IconTrash />}
                        title="ยืนยันการลบรีวิว?"
                        description="คุณต้องการลบรีวิวสินค้านี้ใช่หรือไม่? หากลบแล้วจะไม่สามารถกู้คืนข้อมูลได้"
                        onDelete={() => deleteMutation.mutate(item.id)}
                      />
                    </TableCell>
                  )}
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
    </>
  )
}
