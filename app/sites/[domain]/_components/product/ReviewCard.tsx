import { Review } from '@/types/sites/review'
import { getRatingLabel } from '@/utils/review'
import { User2Icon } from 'lucide-react'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'

import { ReviewMedia } from './ReviewMedia'
import { StarRating } from './StarRating'

export function ReviewCard({ review }: { review: Review }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Avatar className="size-8 border">
            <AvatarImage src="" />
            <AvatarFallback>
              <User2Icon size={16} />
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="text-sm font-bold text-slate-900">{review.user}</p>
            <div className="mt-1.5">
              <StarRating rating={review.rating} />
            </div>
            <div className="text-muted-foreground mt-2.5 text-xs">
              <span>{review.date}</span>
              <span>| {review.variantTitle}</span>
              {review.selectedOptions && (
                <div className="flex gap-2">
                  {review.selectedOptions.map((opt) => (
                    <span key={opt.title}>
                      {opt.title}: {opt.name}
                    </span>
                  ))}
                  <span>({review.sku})</span>
                </div>
              )}
            </div>
            <div className="text-muted-foreground mt-2 flex flex-col gap-1 text-xs">
              {review?.categories?.map((category) => {
                return (
                  <span key={category.label}>
                    {category?.label}: {getRatingLabel(category.rating)}
                  </span>
                )
              })}
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
