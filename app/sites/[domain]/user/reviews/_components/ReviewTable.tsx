/* eslint-disable @next/next/no-img-element */
'use client'

import { useState } from 'react'

import { useReviewRewardConfig } from '@/actions/hooks/store-reward-review'
import { usePurchasableProducts } from '@/actions/hooks/storefront/review'
import { formatDateTime } from '@/utils/date'
import { IconMessagePlus, IconStarFilled } from '@tabler/icons-react'

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

function ReviewActionButton({
  item,
  onSelect,
}: {
  item: {
    storeId: string
    productId: string
    variantId: string
    orderId: string
    productTitle: string
    productImage?: string
  }
  onSelect: () => void
}) {
  const { data: rewardConfigRes } = useReviewRewardConfig(item.storeId)
  const isRewardEnabled = rewardConfigRes?.data?.isEnabled ?? false

  return (
    <Button size="sm" onClick={onSelect}>
      <IconMessagePlus className="size-4" />
      {isRewardEnabled ? 'เขียนรีวิวรับแต้ม' : 'เขียนรีวิว'}
    </Button>
  )
}

export function MyReviewTable() {
  const [selectedItem, setSelectedItem] = useState<{
    storeId: string
    productId: string
    variantId: string
    orderId: string
    productTitle: string
    productImage?: string
  } | null>(null)

  const { data: items = [], isLoading } = usePurchasableProducts()

  const hasUnreviewedItems = items.some((item) => !item.reviewId)

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>หมายเลขคำสั่งซื้อ</TableHead>
              <TableHead>สินค้า</TableHead>
              <TableHead>คะแนน</TableHead>
              <TableHead>ความคิดเห็น</TableHead>
              <TableHead>วันที่เขียน</TableHead>
              {hasUnreviewedItems && (
                <TableHead className="text-right">จัดการ</TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableLoadingRow colSpan={hasUnreviewedItems ? 6 : 5} />
            ) : items.length === 0 ? (
              <TableEmptyRow
                colSpan={hasUnreviewedItems ? 6 : 5}
                title="ยังไม่มีรายการสินค้าที่จัดส่งสำเร็จ หรือพร้อมให้รีวิว"
              />
            ) : (
              items.map((item) => {
                const isReviewed = !!item.reviewId

                return (
                  <TableRow
                    key={`${item.orderId}-${item.productId}-${item.variantId}`}
                  >
                    <TableCell>#{item.orderNumber}</TableCell>
                    <TableCell className="max-w-72 min-w-72 wrap-break-word whitespace-pre-line">
                      <div>{item.productTitle}</div>
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
                    <TableCell className="max-w-72 min-w-72 wrap-break-word whitespace-pre-line">
                      {isReviewed ? (
                        <div>
                          <p className="text-sm">{item.comment || '-'}</p>
                          {item.reviewImages &&
                            item.reviewImages.length > 0 && (
                              <div className="mt-1 flex gap-1">
                                {item.reviewImages.map((img, idx) => (
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
                      ) : (
                        <span className="text-muted-foreground text-xs">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {item.reviewDate
                        ? formatDateTime(new Date(item.reviewDate))
                        : '-'}
                    </TableCell>
                    {hasUnreviewedItems && (
                      <TableCell className="text-right">
                        {!isReviewed && (
                          <ReviewActionButton
                            item={item}
                            onSelect={() =>
                              setSelectedItem({
                                storeId: item.storeId,
                                productId: item.productId,
                                variantId: item.variantId,
                                orderId: item.orderId,
                                productTitle: item.productTitle,
                                productImage: item.productImage,
                              })
                            }
                          />
                        )}
                      </TableCell>
                    )}
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
          targetInfo={selectedItem}
        />
      )}
    </>
  )
}
