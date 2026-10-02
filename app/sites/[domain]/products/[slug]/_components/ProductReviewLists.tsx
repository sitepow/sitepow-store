'use client'

import { useStorefrontProductDetail } from '@/actions/hooks/storefront/product'
import { Separator } from '@/components/ui/separator'

import { useProductPurchaseStore } from '../../store'
import { ProductReviewRating } from './ProductReviewRating'
import { ReviewCard } from './ReviewCard'

interface Props {
  storeSlug?: string
  productSlug?: string
}

export function ProductReviewLists({ storeSlug, productSlug }: Props) {
  const { data: queryProduct } = useStorefrontProductDetail(
    storeSlug ?? '',
    productSlug ?? '',
  )
  const storeReviews = useProductPurchaseStore((s) => s.product?.reviews)
  const reviews = queryProduct?.reviews ?? storeReviews

  if (!reviews || reviews.length === 0) {
    return null
  }

  return (
    <section aria-labelledby="reviews-heading" className="mt-20 space-y-8">
      <div className="flex items-center gap-2">
        <h2 id="reviews-heading" className="text-xl font-bold">
          รีวิวจากลูกค้า
        </h2>
        <Separator className="flex-1" />
      </div>
      <ProductReviewRating reviews={reviews} />
      <ul
        role="list"
        aria-label="รายการรีวิวจากลูกค้า"
        className="space-y-10 pt-4"
      >
        {reviews.map((review) => (
          <li key={review.id} className="list-none">
            <ReviewCard review={review} />
          </li>
        ))}
      </ul>
    </section>
  )
}
