'use client'

import { useFormContext, useWatch } from 'react-hook-form'

import { usePricingStore } from '@/app/(main)/pricing/store'
import { RadioCard } from '@/app/sites/[domain]/cart/_components/RadioCard'
import { PLAN_DETAILS } from '@/constants/plan'
import { PRICING_VALUE } from '@/constants/pricing'
import { Plan } from '@/generated/prisma/enums'
import { calculatePlanPrice, formatCurrency } from '@/utils/pricing'
import { CreateStoreFormValues } from '@/zod/store'

import { Field, FieldError } from '@/components/ui/field'
import { RadioGroup } from '@/components/ui/radio-group'
import { useTranslations } from 'next-intl'

interface PlanSelectorProps {
  isPending: boolean
}

export function PlanSelector({ isPending }: PlanSelectorProps) {
  const t = useTranslations('merchant.stores.dialog')
  const selectedTab = usePricingStore((state) => state.selectedTab)
  const {
    control,
    setValue,
    formState: { errors },
  } = useFormContext<CreateStoreFormValues>()

  const selectedPlan = useWatch({
    control,
    name: 'plan',
  })

  return (
    <Field className="space-y-3 sm:col-span-2">
      <RadioGroup
        value={selectedPlan}
        disabled={isPending}
        onValueChange={(value) => {
          setValue('plan', value as Plan, { shouldValidate: true })
        }}
      >
        <div className="grid gap-3 sm:grid-cols-2">
          {(Object.keys(PLAN_DETAILS) as Plan[]).map((key) => {
            const plan = PLAN_DETAILS[key]
            const {
              finalPrice,
              basePrice,
              averagePerMonth,
              totalPriceBeforeDiscount,
              discountPercent,
            } = calculatePlanPrice(plan.price.toString(), selectedTab)

            return (
              <RadioCard
                key={key}
                id={`plan-${key}`}
                value={key}
                className={isPending ? 'cursor-not-allowed opacity-60' : ''}
                title={plan.name}
                description={plan.description}
                trailing={
                  <div className="flex flex-col gap-0.5">
                    {basePrice > 0 && discountPercent > 0 && (
                      <span className="text-muted-foreground text-[10px] line-through">
                        {formatCurrency(Number(totalPriceBeforeDiscount))}
                      </span>
                    )}
                    <div className="flex items-center gap-2">
                      <b className="text-primary text-xl">
                        {basePrice === 0
                          ? formatCurrency(0)
                          : formatCurrency(Number(finalPrice))}
                      </b>
                    </div>
                    {basePrice > 0 &&
                      selectedTab !== PRICING_VALUE.ONE_MONTH && (
                        <span className="text-[10px] font-medium opacity-60">
                          {t('averagePerMonth', {
                            price: formatCurrency(Number(averagePerMonth)),
                          })}
                        </span>
                      )}
                  </div>
                }
              >
                <div className="text-xs opacity-60">
                  {plan.features.join(', ')}
                </div>
              </RadioCard>
            )
          })}
        </div>
      </RadioGroup>
      <FieldError>{errors?.plan?.message}</FieldError>
    </Field>
  )
}
