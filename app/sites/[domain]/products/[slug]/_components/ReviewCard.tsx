'use client'

import { useTranslations } from 'next-intl'

import { StorefrontProductDetail } from '@/actions/storefront/product'
import { getRatingLabel } from '@/utils/review'
import { CheckCircle2, User2Icon } from 'lucide-react'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'

import { StarRating } from '../../../_components/product/StarRating'
import { ReviewMedia } from './ReviewMedia'

type ReviewItem = StorefrontProductDetail['reviews'][number]

export function ReviewCard({ review }: { review: ReviewItem }) {
  const t = useTranslations('storefront.products')
  const customerName =
    [review.customer.firstName, review.customer.lastName]
      .filter(Boolean)
      .join(' ') || t('anonymousCustomer')

  const selectedOptions = review.selectedOptions as
    { title: string; name: string }[] | null

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Avatar className="size-8 border">
            <AvatarImage src={review.customer.avatar ?? ''} />
            <AvatarFallback>
              <User2Icon size={16} />
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="flex items-center gap-2">
              <p className="text-sm font-bold">{customerName}</p>
              <Badge
                variant="secondary"
                className="gap-1 border-emerald-200/60 bg-emerald-50 px-2 py-0.5 text-[10px] font-normal text-emerald-700 hover:bg-emerald-50 dark:border-emerald-800/60 dark:bg-emerald-950/40 dark:text-emerald-400"
              >
                <CheckCircle2 className="size-3 text-emerald-600 dark:text-emerald-400" />
                <span>{t('verifiedPurchase')}</span>
              </Badge>
            </div>
            <div className="mt-1.5">
              <StarRating rating={review.rating} />
            </div>
            <div className="text-muted-foreground mt-2.5 text-xs">
              <span>{new Date(review.date).toLocaleDateString('th-TH')}</span>
              {review.variant?.title && <span> | {review.variant.title}</span>}
              {selectedOptions && selectedOptions.length > 0 && (
                <div className="flex gap-2">
                  {selectedOptions.map((opt) => (
                    <span key={opt.title}>
                      {opt.title}: {opt.name}
                    </span>
                  ))}
                  {review.variant?.sku && <span>({review.variant.sku})</span>}
                </div>
              )}
            </div>
            <div className="text-muted-foreground mt-2 flex flex-col gap-1 text-xs">
              {review.categories?.map((category) => (
                <span key={category.id}>
                  {category.label}: {getRatingLabel(category.rating)}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
      <p className="text-sm leading-relaxed">{review.comment}</p>
      <ReviewMedia images={review.images} video={review.video} />
      <Separator className="mt-6 opacity-50" />
    </div>
  )
}
