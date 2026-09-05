'use client'

import { useTranslations } from 'next-intl'

import { Separator } from '@/components/ui/separator'

import { useProductPurchaseStore } from '../../store'
import { ProductReviewRating } from './ProductReviewRating'
import { ReviewCard } from './ReviewCard'

export function ProductReviewLists() {
  const t = useTranslations('storefront.products')
  const reviews = useProductPurchaseStore((s) => s.product?.reviews)

  if (!reviews || reviews.length === 0) {
    return null
  }

  return (
    <div className="mt-20 space-y-8">
      <div className="flex items-center gap-2">
        <h3 className="text-xl font-bold">{t('customerReviews')}</h3>
        <Separator className="flex-1" />
      </div>
      <ProductReviewRating reviews={reviews} />
      <div className="space-y-10 pt-4">
        {reviews.map((review) => (
          <ReviewCard key={review.id} review={review} />
        ))}
      </div>
    </div>
  )
}
