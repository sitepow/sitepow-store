'use client'

import { useState } from 'react'

import { useTranslations } from 'next-intl'
import Link from 'next/link'

import {
  useDeleteProduct,
  useProductQuota,
  useProducts,
} from '@/actions/hooks/product'
import { StorePagination } from '@/app/sites/[domain]/_components/Pagination'
import { useCurrentStore } from '@/hooks/use-current-store'
import { useIsMounted } from '@/hooks/use-is-mounted'
import { ALL_STORES, useStoreFilter } from '@/stores/use-store-filter'
import { formatCurrency } from '@/utils/pricing'
import { IconEdit, IconPackage } from '@tabler/icons-react'

import { DeleteButton } from '@/components/DeleteButton'
import { ProductImage } from '@/components/ProductImage'
import { TableEmptyRow } from '@/components/TableEmptyRow'
import { TableLoadingRow } from '@/components/TableLoadingRow'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

export function ProductsTable() {
  const { currentStore, store } = useCurrentStore()
  const t = useTranslations('merchant.products')
  const isMounted = useIsMounted()
  const { selectedStoreId } = useStoreFilter()
  const [page, setPage] = useState(1)

  const { data: quota, isLoading: isQuotaLoading } =
    useProductQuota(selectedStoreId)

  const isLimitReached =
    quota && quota.maxProducts !== null
      ? quota.productCount >= quota.maxProducts
      : false

  const { mutate: deleteProduct, isPending: isDeleting } = useDeleteProduct()
  const { data: { data: products = [], meta } = {}, isLoading } = useProducts({
    storeId: selectedStoreId,
    page,
    limit: 10,
  })

  if (!isMounted) {
    return null
  }

  const progress = quota?.maxProducts
    ? (quota.productCount / quota.maxProducts) * 100
    : 0

  return (
    <div
      className="space-y-4"
      style={
        {
          '--primary': currentStore?.primaryColor ?? store?.primaryColor,
        } as React.CSSProperties
      }
    >
      {selectedStoreId !== ALL_STORES && (
        <Card className="from-primary/10 via-primary/2 to-background border-primary/20 flex h-fit flex-col justify-between overflow-hidden bg-linear-to-br xl:col-span-1">
          <CardHeader className="pb-2">
            <CardDescription className="text-primary text-xs font-bold">
              {t('totalInventory')}
            </CardDescription>
            <CardTitle className="text-foreground flex items-baseline gap-1 pt-1 text-4xl font-extrabold">
              {isQuotaLoading ? (
                <Skeleton className="h-9 w-40" />
              ) : (
                (quota?.productCount ?? 0)
              )}
              <span className="text-muted-foreground text-xs font-normal">
                /{' '}
                {quota?.maxProducts
                  ? t('productCount', { count: quota.maxProducts })
                  : t('unlimitedProducts')}
              </span>
            </CardTitle>
          </CardHeader>
          {quota?.maxProducts && (
            <CardContent className="text-muted-foreground max-w-96 pb-4 text-[11px] leading-relaxed">
              <Progress value={progress} className="h-2" />
              <p className="mt-2">
                {isLimitReached
                  ? t('quotaReached')
                  : t('quotaUsed', { percent: progress.toFixed(0) })}
              </p>
            </CardContent>
          )}
        </Card>
      )}
      <div className="overflow-x-auto rounded-md border">
        <Table className="min-w-225 border-separate border-spacing-0">
          <TableHeader>
            <TableRow>
              <TableHead className="bg-background sticky left-0 z-20 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">
                {t('columns.image')}
              </TableHead>
              <TableHead>{t('columns.productAndSlug')}</TableHead>
              <TableHead>{t('columns.store')}</TableHead>
              <TableHead>{t('columns.category')}</TableHead>
              <TableHead>{t('columns.startingPrice')}</TableHead>
              <TableHead>{t('columns.status')}</TableHead>
              <TableHead className="text-right">
                {t('columns.actions')}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && products.length === 0 ? (
              <TableLoadingRow colSpan={7} />
            ) : products.length === 0 ? (
              <TableEmptyRow colSpan={7} title={t('empty')} />
            ) : (
              products.map((product) => {
                const basePrice = product.variants?.[0]?.price
                  ? Number(product.variants[0].price)
                  : 0

                return (
                  <TableRow key={product.id} className="hover:bg-muted/50">
                    <TableCell className="bg-background hover:bg-muted/50 sticky left-0 z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">
                      <ProductImage
                        src={product.images?.[0]?.url}
                        alt={product.title}
                      />
                    </TableCell>
                    <TableCell className="max-w-72 min-w-72 wrap-break-word whitespace-pre-line">
                      <div className="flex flex-col">
                        <span className="font-medium">{product.title}</span>
                        <span className="text-muted-foreground">
                          {product.slug}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {product.store?.name ?? ''}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {product.category?.title ?? ''}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatCurrency(basePrice)}</TableCell>
                    <TableCell>
                      {product.isPublished ? (
                        <Badge>{t('published')}</Badge>
                      ) : (
                        <Badge variant="outline">{t('hidden')}</Badge>
                      )}
                    </TableCell>
                    <TableCell className="space-x-2 text-right">
                      <Button variant="outline" size="icon-lg" asChild>
                        <Link href={'/merchant/inventory'}>
                          <IconPackage />
                        </Link>
                      </Button>
                      <Button variant="outline" size="icon-lg" asChild>
                        <Link
                          href={`/merchant/store-settings/products/create/${product.id}`}
                        >
                          <IconEdit className="size-4" />
                        </Link>
                      </Button>
                      <DeleteButton
                        isPending={isDeleting}
                        onDelete={() => deleteProduct(product.id)}
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
    </div>
  )
}
