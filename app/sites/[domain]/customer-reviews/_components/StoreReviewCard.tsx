'use client'

import { useLocale, useTranslations } from 'next-intl'
import Link from 'next/link'

import { StoreCustomerReviewItem } from '@/actions/storefront/review'
import { getRatingLabel } from '@/utils/review'
import { CheckCircle2, Package, User2Icon } from 'lucide-react'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

import { StarRating } from '../../_components/product/StarRating'
import { ReviewMedia } from '../../products/[slug]/_components/ReviewMedia'

interface StoreReviewCardProps {
  review: StoreCustomerReviewItem
}

export function StoreReviewCard({ review }: StoreReviewCardProps) {
  const t = useTranslations('storefront.customerReviews')
  const locale = useLocale()

  const customerName =
    [review.customer?.firstName, review.customer?.lastName]
      .filter(Boolean)
      .join(' ') || t('anonymousCustomer')

  const selectedOptions = review.selectedOptions as
    { title: string; name: string }[] | null

  const productImage = review.product?.images?.[0]?.url
  const formattedDate = new Date(review.date).toLocaleDateString(
    locale === 'th' ? 'th-TH' : 'en-US',
    {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    },
  )

  return (
    <Card className="border-border/80 bg-card hover:border-border transition-all hover:shadow-xs">
      <CardContent className="space-y-4 p-5 sm:p-6">
        {/* Header: Customer Info & Rating */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="border-border/60 size-10 border">
              <AvatarImage
                src={review.customer?.avatar ?? ''}
                alt={customerName}
              />
              <AvatarFallback className="bg-muted">
                <User2Icon className="text-muted-foreground size-5" />
              </AvatarFallback>
            </Avatar>

            <div className="min-w-0 space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-foreground max-w-48 truncate text-sm font-semibold sm:max-w-64">
                  {customerName}
                </span>

                <Badge
                  variant="secondary"
                  className="gap-1 border-emerald-200/60 bg-emerald-50 px-2 py-0.5 text-[10px] font-normal text-emerald-700 hover:bg-emerald-50 dark:border-emerald-800/60 dark:bg-emerald-950/40 dark:text-emerald-400"
                >
                  <CheckCircle2 className="size-3 shrink-0 text-emerald-600 dark:text-emerald-400" />
                  <span>{t('verifiedPurchase')}</span>
                </Badge>
              </div>

              <div className="flex items-center gap-2">
                <StarRating rating={review.rating} size={14} />
                <span className="text-muted-foreground text-[11px]">
                  {formattedDate}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Product Reference Card */}
        {review.product && (
          <div className="border-border/60 bg-muted/30 flex items-center gap-3 rounded-xl border p-2.5 sm:p-3">
            <Link
              href={`/products/${review.product.slug}`}
              className="border-border/40 bg-muted relative size-12 shrink-0 overflow-hidden rounded-lg border transition-opacity hover:opacity-80 sm:size-14"
            >
              {productImage ? (
                <img
                  src={productImage}
                  alt={review.product.title}
                  className="size-full object-cover"
                />
              ) : (
                <div className="text-muted-foreground flex size-full items-center justify-center">
                  <Package className="size-5" />
                </div>
              )}
            </Link>

            <div className="min-w-0 flex-1 space-y-0.5">
              <Link
                href={`/products/${review.product.slug}`}
                className="text-foreground hover:text-primary line-clamp-1 text-xs font-medium transition-colors sm:text-sm"
                title={review.product.title}
              >
                {review.product.title}
              </Link>

              {(review.variant?.title ||
                (selectedOptions && selectedOptions.length > 0)) && (
                <div className="text-muted-foreground flex flex-wrap items-center gap-x-2 text-[11px]">
                  {review.variant?.title && <span>{review.variant.title}</span>}
                  {selectedOptions && selectedOptions.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {selectedOptions.map((opt) => (
                        <span key={opt.title} className="opacity-80">
                          {opt.title}: {opt.name}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            <Button
              asChild
              variant="ghost"
              size="sm"
              className="hidden shrink-0 text-xs sm:inline-flex"
            >
              <Link href={`/products/${review.product.slug}`}>
                {t('viewProduct')}
              </Link>
            </Button>
          </div>
        )}

        {/* Review Comment */}
        {review.comment && (
          <p className="text-foreground/90 text-sm leading-relaxed break-words whitespace-pre-line">
            {review.comment}
          </p>
        )}

        {/* Media attachments */}
        <ReviewMedia images={review.images || []} video={review.video} />

        {/* Sub-ratings / Categories */}
        {review.categories && review.categories.length > 0 && (
          <div className="border-border/40 flex flex-wrap items-center gap-2 border-t pt-1">
            <span className="text-muted-foreground text-[11px] font-medium">
              {t('subRatings')}:
            </span>
            {review.categories.map((category) => (
              <span
                key={category.id}
                className="bg-muted/60 text-foreground/80 inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px]"
              >
                <span>{category.label}</span>
                <span className="font-semibold text-yellow-600 dark:text-yellow-400">
                  {category.rating}/5
                </span>
                <span className="text-muted-foreground text-[10px]">
                  ({getRatingLabel(category.rating)})
                </span>
              </span>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
