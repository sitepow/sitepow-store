'use client'

import { useTranslations } from 'next-intl'

import { StoreReviewSummary } from '@/actions/storefront/review'
import { IconPhoto, IconStarFilled } from '@tabler/icons-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'

import { cn } from '@/lib/utils'

import { StarRating } from '../../_components/product/StarRating'

interface StoreRatingSummaryProps {
  summary: StoreReviewSummary
  selectedRating?: number
  hasMediaOnly?: boolean
  onSelectRating: (rating?: number) => void
  onToggleMediaOnly: (mediaOnly: boolean) => void
}

export function StoreRatingSummary({
  summary,
  selectedRating,
  hasMediaOnly,
  onSelectRating,
  onToggleMediaOnly,
}: StoreRatingSummaryProps) {
  const t = useTranslations('storefront.customerReviews')
  const { averageRating, totalReviews, breakdown, withMediaCount } = summary

  const isAllSelected = selectedRating === undefined && !hasMediaOnly

  return (
    <Card className="border-border/80 bg-card overflow-hidden shadow-xs">
      <CardContent className="space-y-6 p-5 sm:p-7">
        {/* Main rating score and breakdown progress bars */}
        <div className="grid grid-cols-1 items-center gap-6 md:grid-cols-12 md:gap-8">
          {/* Left score panel */}
          <div className="md:border-border/60 flex flex-col items-center justify-center space-y-2.5 text-center md:col-span-4 md:border-r md:pr-8">
            <div className="flex items-baseline gap-1">
              <span className="text-foreground text-5xl font-black tracking-tight sm:text-6xl">
                {averageRating.toFixed(1)}
              </span>
              <span className="text-muted-foreground text-lg font-medium">
                / 5
              </span>
            </div>

            <StarRating rating={Math.round(averageRating)} size={20} />

            <div className="space-y-1">
              <p className="text-foreground text-xs font-semibold sm:text-sm">
                {t('overallRating')}
              </p>
              <p className="text-muted-foreground text-xs">
                {t('totalReviews', { count: totalReviews })}
              </p>
            </div>
          </div>

          {/* Right breakdown bars */}
          <div className="flex-1 space-y-2 md:col-span-8">
            {breakdown.map((item) => {
              const isCurrentStarActive = selectedRating === item.star

              return (
                <button
                  type="button"
                  key={item.star}
                  onClick={() =>
                    onSelectRating(isCurrentStarActive ? undefined : item.star)
                  }
                  className={cn(
                    'group hover:bg-muted/60 flex w-full items-center gap-3 rounded-lg px-2.5 py-1 text-xs transition-colors',
                    isCurrentStarActive &&
                      'bg-primary/10 ring-primary/30 font-medium ring-1',
                  )}
                  title={t('starsFilter', {
                    star: item.star,
                    count: item.count,
                  })}
                >
                  <div className="flex w-14 shrink-0 items-center gap-1 font-medium">
                    <span>{item.star}</span>
                    <IconStarFilled className="size-3.5 shrink-0 text-yellow-400" />
                  </div>

                  <div className="flex-1">
                    <Progress
                      value={item.percentage}
                      className="bg-muted h-2.5 rounded-full"
                    />
                  </div>

                  <div className="text-muted-foreground group-hover:text-foreground w-16 shrink-0 text-right">
                    <span>{item.count}</span>
                    <span className="ml-1 text-[10px] opacity-70">
                      ({item.percentage}%)
                    </span>
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {/* Filter Pills */}
        <div className="border-border/60 border-t pt-5">
          <div className="mb-3 flex items-center gap-2">
            <span className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
              {t('filterBy')}
            </span>
          </div>

          <div className="flex w-full scrollbar-none items-center gap-2 overflow-x-auto pb-1">
            {/* All reviews button */}
            <Button
              type="button"
              variant={isAllSelected ? 'default' : 'outline'}
              size="sm"
              onClick={() => {
                onSelectRating(undefined)
                onToggleMediaOnly(false)
              }}
              className="shrink-0 rounded-full text-xs"
            >
              {t('allFilter', { count: totalReviews })}
            </Button>

            {/* Stars buttons */}
            {[5, 4, 3, 2, 1].map((star) => {
              const starCount =
                breakdown.find((b) => b.star === star)?.count || 0
              const isActive = selectedRating === star && !hasMediaOnly

              return (
                <Button
                  type="button"
                  key={star}
                  variant={isActive ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => {
                    onToggleMediaOnly(false)
                    onSelectRating(isActive ? undefined : star)
                  }}
                  className="shrink-0 gap-1 rounded-full text-xs"
                >
                  <IconStarFilled className="size-3.5 text-yellow-400" />
                  <span>{t('starsFilter', { star, count: starCount })}</span>
                </Button>
              )
            })}

            {/* With Media button */}
            {withMediaCount > 0 && (
              <Button
                type="button"
                variant={hasMediaOnly ? 'default' : 'outline'}
                size="sm"
                onClick={() => {
                  onSelectRating(undefined)
                  onToggleMediaOnly(!hasMediaOnly)
                }}
                className="shrink-0 gap-1.5 rounded-full text-xs"
              >
                <IconPhoto className="size-3.5" />
                <span>{t('withMediaFilter', { count: withMediaCount })}</span>
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
