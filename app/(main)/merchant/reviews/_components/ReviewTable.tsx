/* eslint-disable @next/next/no-img-element */
'use client'

import { useState } from 'react'

import { useEmployeePermission } from '@/actions/store/employee/hooks'
import { useReviews } from '@/actions/catalog/review/hooks'
import { useDeleteReview } from '@/actions/storefront/review/hooks'
import { StorePagination } from '@/app/sites/[domain]/_components/Pagination'
import { ReviewFormDialog } from '@/app/sites/[domain]/user/reviews/_components/ReviewFormDialog'
import { ALL_STORES, useStoreFilter } from '@/stores/use-store-filter'
import { formatDateTime } from '@/utils/formatting/date'
import {
  IconEdit,
  IconLock,
  IconStarFilled,
  IconTrash,
} from '@tabler/icons-react'

import { ActionRequiredAlert } from '@/components/ActionRequiredAlert'
import { DeleteButton } from '@/components/DeleteButton'
import { TableEmptyRow } from '@/components/TableEmptyRow'
import { TableLoadingRow } from '@/components/TableLoadingRow'
import { Button } from '@/components/ui/button'
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
  const [selectedItem, setSelectedItem] = useState<{
    reviewId?: string
    storeId: string
    productId: string
    variantId?: string
    orderId?: string
    productTitle?: string
    productImage?: string
    rating?: number
    comment?: string
    images?: string[]
  } | null>(null)

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
              {showManageColumn && (
                <TableHead className="text-right">จัดการ</TableHead>
              )}
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
                  <TableCell className="max-w-72 min-w-72 wrap-break-word whitespace-pre-line">
                    <div>{item.product?.title || '-'}</div>
                    {item.variant?.title && (
                      <div className="text-muted-foreground text-xs">
                        ตัวเลือก: {item.variant.title}
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="max-w-48 min-w-48 wrap-break-word whitespace-pre-line">
                    <div>
                      {[item.customer?.firstName, item.customer?.lastName]
                        .filter(Boolean)
                        .join(' ') || 'ลูกค้าไม่ระบุชื่อ'}
                    </div>
                    <div className="text-muted-foreground text-xs">
                      {item.customer?.email || '-'}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 font-semibold">
                      {item.rating}
                      <IconStarFilled className="size-4 text-amber-400" />
                    </div>
                  </TableCell>
                  <TableCell className="max-w-72 min-w-72 wrap-break-word whitespace-pre-line">
                    <div>
                      <p className="text-sm">{item?.comment || '-'}</p>
                      {item.images && item.images.length > 0 && (
                        <div className="mt-1 flex gap-1">
                          {item.images.map((img: string, idx: number) => (
                            <div
                              key={idx}
                              className="border-primary border border-dashed p-1"
                            >
                              <img
                                src={img}
                                alt="Review"
                                className="size-14 object-cover"
                              />
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  {showManageColumn && (
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            setSelectedItem({
                              reviewId: item.id,
                              storeId: selectedStoreId,
                              productId: item.productId,
                              variantId: item.variantId,
                              orderId: item.orderId,
                              productTitle: item.product?.title,
                              productImage: item.product?.image,
                              rating: item.rating,
                              comment: item.comment,
                              images: item.images,
                            })
                          }
                        >
                          <IconEdit className="size-4" />
                          แก้ไข
                        </Button>
                        <DeleteButton
                          isPending={deleteMutation.isPending}
                          icon={<IconTrash className="size-4" />}
                          title="ยืนยันการลบรีวิว?"
                          description="คุณต้องการลบรีวิวสินค้านี้ใช่หรือไม่? หากลบแล้วจะไม่สามารถกู้คืนข้อมูลได้"
                          onDelete={() => deleteMutation.mutate(item.id)}
                        />
                      </div>
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
      {selectedItem && (
        <ReviewFormDialog
          isOpen={!!selectedItem}
          onClose={() => setSelectedItem(null)}
          initialData={
            selectedItem.reviewId
              ? {
                  id: selectedItem.reviewId,
                  rating: selectedItem.rating || 5,
                  comment: selectedItem.comment || '',
                  images: selectedItem.images || [],
                }
              : undefined
          }
          targetInfo={{
            storeId: selectedItem.storeId,
            productId: selectedItem.productId,
            variantId: selectedItem.variantId || '',
            orderId: selectedItem.orderId,
            productTitle: selectedItem.productTitle,
            productImage: selectedItem.productImage,
          }}
        />
      )}
    </>
  )
}
