'use client'

import { useState } from 'react'

import { usePurchasableProducts } from '@/actions/hooks/storefront/review'
import { formatDateTime } from '@/utils/date'
import { IconEdit, IconMessagePlus, IconStarFilled } from '@tabler/icons-react'

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

import { ReviewFormDialog } from './ReviewFormDialog'

export function MyReviewTable() {
  const [selectedItem, setSelectedItem] = useState<{
    reviewId?: string
    storeId: string
    productId: string
    variantId: string
    orderId: string
    productTitle: string
    productImage?: string
    rating?: number
    comment?: string
    images?: string[]
  } | null>(null)

  const { data: items = [], isLoading } = usePurchasableProducts()

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>สินค้า</TableHead>
              <TableHead>คะแนน</TableHead>
              <TableHead>ความคิดเห็น</TableHead>
              <TableHead>วันที่เขียน</TableHead>
              <TableHead className="text-right">จัดการ</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableLoadingRow colSpan={5} />
            ) : items.length === 0 ? (
              <TableEmptyRow
                colSpan={5}
                title="ยังไม่มีรายการสินค้าที่จัดส่งสำเร็จ หรือพร้อมให้รีวิว"
              />
            ) : (
              items.map((item) => {
                const isReviewed = !!item.reviewId

                return (
                  <TableRow
                    key={`${item.orderId}-${item.productId}-${item.variantId}`}
                  >
                    <TableCell>
                      <div className="flex items-center gap-3">
                        {item.productImage && (
                          <img
                            src={item.productImage}
                            alt={item.productTitle}
                            className="h-12 w-12 rounded object-cover"
                          />
                        )}
                        <div>
                          <div className="font-medium">{item.productTitle}</div>
                          <div className="text-muted-foreground text-xs">
                            หมายเลขคำสั่งซื้อ: #{item.orderNumber}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {isReviewed ? (
                        <div className="flex items-center gap-1 font-semibold">
                          {item.rating}
                          <IconStarFilled className="size-4 text-amber-400" />
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-xs">
                          ยังไม่ได้รีวิว
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      {isReviewed ? (
                        <div>
                          <p className="text-sm">{item.comment}</p>
                          {item.reviewImages &&
                            item.reviewImages.length > 0 && (
                              <div className="mt-1 flex gap-1">
                                {item.reviewImages.map((img, idx) => (
                                  <img
                                    key={idx}
                                    src={img}
                                    alt="Review"
                                    className="h-8 w-8 rounded object-cover"
                                  />
                                ))}
                              </div>
                            )}
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-xs">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {item.reviewDate
                        ? formatDateTime(new Date(item.reviewDate))
                        : '-'}
                    </TableCell>
                    <TableCell className="text-right">
                      {isReviewed ? (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            setSelectedItem({
                              reviewId: item.reviewId,
                              storeId: item.storeId,
                              productId: item.productId,
                              variantId: item.variantId,
                              orderId: item.orderId,
                              productTitle: item.productTitle,
                              productImage: item.productImage,
                              rating: item.rating,
                              comment: item.comment,
                              images: item.reviewImages,
                            })
                          }
                        >
                          <IconEdit className="mr-1 size-4" />
                          แก้ไข
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          onClick={() =>
                            setSelectedItem({
                              storeId: item.storeId,
                              productId: item.productId,
                              variantId: item.variantId,
                              orderId: item.orderId,
                              productTitle: item.productTitle,
                              productImage: item.productImage,
                            })
                          }
                        >
                          <IconMessagePlus className="mr-1 size-4" />
                          เขียนรีวิว
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </div>
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
            variantId: selectedItem.variantId,
            orderId: selectedItem.orderId,
            productTitle: selectedItem.productTitle,
            productImage: selectedItem.productImage,
          }}
        />
      )}
    </>
  )
}
