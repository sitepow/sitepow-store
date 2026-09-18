'use client'

import React from 'react'
import { Control, Controller } from 'react-hook-form'
import { useTranslations } from 'next-intl'
import { IconStar, IconStarFilled } from '@tabler/icons-react'

import { ReviewFormValues } from '@/zod/storefront/review'
import { Field, FieldLabel } from '@/components/ui/field'

interface ReviewRatingStarsProps {
  control: Control<ReviewFormValues>
  error?: string
}

export function ReviewRatingStars({ control, error }: ReviewRatingStarsProps) {
  const t = useTranslations('customer.reviews')

  return (
    <Field>
      <div className="flex flex-col items-center justify-center gap-1 py-2">
        <FieldLabel className="text-muted-foreground text-sm">
          {t('rateProduct')}
        </FieldLabel>
        <Controller
          control={control}
          name="rating"
          render={({ field }) => (
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => {
                const isFilled = star <= field.value
                return (
                  <button
                    key={star}
                    type="button"
                    className="p-1 focus:outline-none"
                    onClick={() => field.onChange(star)}
                  >
                    {isFilled ? (
                      <IconStarFilled className="size-8 text-amber-400" />
                    ) : (
                      <IconStar className="size-8 text-gray-300" />
                    )}
                  </button>
                )
              })}
            </div>
          )}
        />
        {error && (
          <p className="text-destructive text-xs">
            {error}
          </p>
        )}
      </div>
    </Field>
  )
}
