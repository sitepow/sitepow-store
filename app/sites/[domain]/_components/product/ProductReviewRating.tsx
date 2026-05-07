import { REVIEWS } from '@/constants/sites/review'

import { Progress } from '@/components/ui/progress'

import { StarRating } from './StarRating'

export function ProductReviewRating() {
  const totalReviews = REVIEWS.length

  const averageRating =
    totalReviews > 0
      ? (
          REVIEWS.reduce((acc, curr) => acc + curr.rating, 0) / totalReviews
        ).toFixed(1)
      : '0.0'

  const starCounts = [5, 4, 3, 2, 1].map((star) => {
    const count = REVIEWS.filter((r) => Math.round(r.rating) === star).length
    const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0
    return { star, percentage }
  })

  return (
    <div className="flex flex-col gap-8 rounded-2xl border p-6 sm:flex-row">
      <div className="flex flex-col items-center justify-center space-y-2 border-gray-100 sm:border-r sm:pr-8">
        <span className="text-5xl font-bold text-slate-900">
          {averageRating}
        </span>
        <StarRating rating={Math.round(Number(averageRating))} size={18} />
        <span className="text-muted-foreground text-xs font-medium">
          {totalReviews} รีวิวทั้งหมด
        </span>
      </div>
      <div className="flex-1 space-y-2.5">
        {starCounts.map((item) => (
          <div key={item.star} className="flex items-center gap-4 text-sm">
            <span className="w-3 font-semibold text-slate-700">
              {item.star}
            </span>
            <Progress value={item.percentage} className="h-2" />
          </div>
        ))}
      </div>
    </div>
  )
}
