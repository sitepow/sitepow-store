import { REVIEWS } from '@/constants/sites/review'

import { Separator } from '@/components/ui/separator'

import { ProductReviewRating } from './ProductReviewRating'
import { ReviewCard } from './review/ReviewCard'

export function ProductReviewLists() {
  return (
    <div className="mt-20 space-y-8">
      <div className="flex items-center gap-2">
        <h3 className="text-xl font-bold">รีวิวจากลูกค้า</h3>
        <Separator className="flex-1" />
      </div>

      <ProductReviewRating />

      <div className="space-y-10 pt-4">
        {REVIEWS.map((review) => (
          <ReviewCard key={review.id} review={review} />
        ))}
      </div>
    </div>
  )
}
