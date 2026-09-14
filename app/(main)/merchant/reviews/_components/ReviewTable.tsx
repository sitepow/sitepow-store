'use client'

import { useCurrentStore } from '@/hooks/use-current-store'
/* eslint-disable @next/next/no-img-element */

import { useState } from 'react'

import { useTranslations } from 'next-intl'

import { useEmployeePermission } from '@/actions/hooks/employee'
import { useReviews } from '@/actions/hooks/review'
import { useDeleteReview } from '@/actions/hooks/storefront/review'
import { StorePagination } from '@/components/StorePagination'
import { ReviewFormDialog } from '@/app/sites/[domain]/user/reviews/_components/ReviewFormDialog'
import { ALL_STORES, useStoreFilter } from '@/stores/use-store-filter'
import { formatDateTime } from '@/utils/date'
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
  const { currentStore, store } = useCurrentStore()
  const t = useTranslations('merchant.reviews')
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
        title={t('noAccessTitle')}
        description={t('noAccessDescription')}
      />
    )
  }

  const showManageColumn = canDeleteReviews
  const totalColumns = showManageColumn ? 6 : 5

  return (
    <div
      className="space-y-4"
      style={{
        '--primary': currentStore?.primaryColor ?? store?.primaryColor,
      } as React.CSSProperties}
    >
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('columns.date')}</TableHead>
              <TableHead>{t('columns.product')}</TableHead>
              <TableHead>{t('columns.customer')}</TableHead>
              <TableHead>{t('columns.rating')}</TableHead>
              <TableHead>{t('columns.comment')}</TableHead>
              {showManageColumn && (
                <TableHead className="text-right">
                  {t('columns.actions')}
                </TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {(isLoading || isPermissionLoading) && reviews.length === 0 ? (
              <TableLoadingRow colSpan={totalColumns} />
            ) : reviews.length === 0 ? (
              <TableEmptyRow colSpan={totalColumns} title={t('empty')} />
            ) : (
              reviews.map((item: any) => (
                <TableRow key={item.id}>
                  <TableCell>{formatDateTime(new Date(item.date))}</TableCell>
                  <TableCell className="max-w-72 min-w-72 wrap-break-word whitespace-pre-line">
                    <div>{item.product?.title || '-'}</div>
                    {item.variant?.title && (
                      <div className="text-muted-foreground text-xs">
                        {t('variantPrefix', { variant: item.variant.title })}
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="max-w-48 min-w-48 wrap-break-word whitespace-pre-line">
                    <div>
                      {[item.customer?.firstName, item.customer?.lastName]
                        .filter(Boolean)
                        .join(' ') || t('anonymousCustomer')}
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
                          {t('edit')}
                        </Button>
                        <DeleteButton
                          isPending={deleteMutation.isPending}
                          icon={<IconTrash className="size-4" />}
                          title={t('deleteConfirmTitle')}
                          description={t('deleteConfirmDescription')}
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
    </div>
  )
}
