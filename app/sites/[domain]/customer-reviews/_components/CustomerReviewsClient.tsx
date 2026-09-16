'use client'

import { useRef, useState } from 'react'

import { useTranslations } from 'next-intl'

import {
  useStoreCustomerReviews,
  useStoreReviewSummary,
} from '@/actions/hooks/storefront/review'
import {
  GetStoreCustomerReviewsResponse,
  StoreReviewSummary as StoreReviewSummaryType,
} from '@/actions/storefront/review'
import {
  IconChevronLeft,
  IconChevronRight,
  IconMessageOff,
  IconStarFilled,
} from '@tabler/icons-react'

import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'

import { StoreRatingSummary } from './StoreRatingSummary'
import { StoreReviewCard } from './StoreReviewCard'

interface CustomerReviewsClientProps {
  storeId: string
  storeName: string
  initialSummary: StoreReviewSummaryType
  initialReviews: GetStoreCustomerReviewsResponse
}

export function CustomerReviewsClient({
  storeId,
  storeName,
  initialSummary,
  initialReviews,
}: CustomerReviewsClientProps) {
  const t = useTranslations('storefront.customerReviews')
  const reviewListRef = useRef<HTMLDivElement>(null)

  const [selectedRating, setSelectedRating] = useState<number | undefined>(
    undefined,
  )
  const [hasMediaOnly, setHasMediaOnly] = useState(false)
  const [page, setPage] = useState(1)

  const { data: summary } = useStoreReviewSummary(storeId, initialSummary)

  const { data: reviewsResponse, isFetching } = useStoreCustomerReviews(
    {
      storeId,
      page,
      limit: 10,
      rating: selectedRating,
      hasMedia: hasMediaOnly,
    },
    // Only pass initialReviews when on page 1 with no filters
    page === 1 && selectedRating === undefined && !hasMediaOnly
      ? initialReviews
      : undefined,
  )

  const reviews = reviewsResponse?.data || []
  const meta = reviewsResponse?.meta || initialReviews.meta

  const handleSelectRating = (rating?: number) => {
    setSelectedRating(rating)
    setPage(1)
  }

  const handleToggleMediaOnly = (mediaOnly: boolean) => {
    setHasMediaOnly(mediaOnly)
    setPage(1)
  }

  const handlePageChange = (newPage: number) => {
    setPage(newPage)
    if (reviewListRef.current) {
      const topOffset =
        reviewListRef.current.getBoundingClientRect().top +
        window.pageYOffset -
        100
      window.scrollTo({ top: topOffset, behavior: 'smooth' })
    }
  }

  const isFilterActive = selectedRating !== undefined || hasMediaOnly

  return (
    <div className="w-full space-y-8">
      {/* Page Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-2.5">
          <div className="bg-primary/10 text-primary flex size-9 items-center justify-center rounded-xl">
            <IconStarFilled className="size-5" />
          </div>
          <h1 className="text-foreground text-2xl font-bold tracking-tight sm:text-3xl">
            {t('title')}
          </h1>
        </div>
        <p className="text-muted-foreground max-w-2xl text-sm leading-relaxed">
          {t('subtitle')} ({storeName})
        </p>
      </div>

      {/* Store Rating & Score Summary */}
      {summary && (
        <StoreRatingSummary
          summary={summary}
          selectedRating={selectedRating}
          hasMediaOnly={hasMediaOnly}
          onSelectRating={handleSelectRating}
          onToggleMediaOnly={handleToggleMediaOnly}
        />
      )}

      {/* Review List Anchor */}
      <div ref={reviewListRef} className="space-y-4 pt-2">
        {/* Results Bar */}
        <div className="border-border/60 flex flex-wrap items-center justify-between gap-3 border-b pb-3">
          <div className="text-muted-foreground flex items-center gap-2 text-xs sm:text-sm">
            <span>{t('showingResults', { count: meta.totalItems })}</span>
            {isFilterActive && (
              <span className="text-foreground font-medium">
                •{' '}
                {selectedRating
                  ? t('starsFilter', {
                      star: selectedRating,
                      count: meta.totalItems,
                    })
                  : ''}
                {hasMediaOnly
                  ? t('withMediaFilter', { count: meta.totalItems })
                  : ''}
              </span>
            )}
          </div>

          {isFilterActive && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                setSelectedRating(undefined)
                setHasMediaOnly(false)
                setPage(1)
              }}
              className="text-primary h-auto p-0 text-xs hover:underline"
            >
              {t('clearFilter')}
            </Button>
          )}
        </div>

        {/* Loading state */}
        {isFetching ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="border-border/60 bg-card space-y-3 rounded-2xl border p-6"
              >
                <div className="flex items-center gap-3">
                  <Skeleton className="size-10 rounded-full" />
                  <div className="flex-1 space-y-1.5">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                </div>
                <Skeleton className="h-16 w-full rounded-xl" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            ))}
          </div>
        ) : reviews.length === 0 ? (
          /* Empty state */
          <div className="border-border/80 bg-muted/10 flex flex-col items-center justify-center space-y-3 rounded-2xl border border-dashed p-12 text-center">
            <div className="bg-muted text-muted-foreground flex size-14 items-center justify-center rounded-full">
              <IconMessageOff className="size-7" />
            </div>
            <div className="max-w-sm space-y-1">
              <h3 className="text-foreground text-base font-semibold">
                {t('emptyTitle')}
              </h3>
              <p className="text-muted-foreground text-xs leading-relaxed sm:text-sm">
                {t('emptyDesc')}
              </p>
            </div>
            {isFilterActive && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  setSelectedRating(undefined)
                  setHasMediaOnly(false)
                  setPage(1)
                }}
                className="mt-2 text-xs"
              >
                {t('clearFilter')}
              </Button>
            )}
          </div>
        ) : (
          /* Reviews Cards List */
          <div className="space-y-4">
            {reviews.map((review) => (
              <StoreReviewCard key={review.id} review={review} />
            ))}
          </div>
        )}

        {/* Pagination Controls */}
        {meta.totalPages > 1 && (
          <div className="border-border/60 flex flex-col items-center justify-between gap-4 border-t pt-6 sm:flex-row">
            <span className="text-muted-foreground text-xs">
              {t('page', { current: meta.currentPage, total: meta.totalPages })}
            </span>

            <div className="flex items-center gap-1.5">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(meta.currentPage - 1)}
                disabled={!meta.hasPreviousPage}
                className="gap-1 text-xs"
              >
                <IconChevronLeft className="size-3.5" />
                <span>{t('previous')}</span>
              </Button>

              {/* Numbered pages */}
              {Array.from({ length: meta.totalPages }, (_, idx) => idx + 1)
                .filter((p) => {
                  return (
                    p === 1 ||
                    p === meta.totalPages ||
                    Math.abs(p - meta.currentPage) <= 1
                  )
                })
                .map((p, idx, arr) => {
                  const prev = arr[idx - 1]
                  const showEllipsis = prev && p - prev > 1

                  return (
                    <div key={p} className="flex items-center">
                      {showEllipsis && (
                        <span className="text-muted-foreground px-1 text-xs">
                          ...
                        </span>
                      )}
                      <Button
                        type="button"
                        variant={p === meta.currentPage ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => handlePageChange(p)}
                        className="size-8 p-0 text-xs"
                      >
                        {p}
                      </Button>
                    </div>
                  )
                })}

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(meta.currentPage + 1)}
                disabled={!meta.hasNextPage}
                className="gap-1 text-xs"
              >
                <span>{t('next')}</span>
                <IconChevronRight className="size-3.5" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
