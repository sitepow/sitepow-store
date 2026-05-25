'use client'

import { useFormContext, useWatch } from 'react-hook-form'

import { RadioCard } from '@/app/sites/[domain]/cart/_components/RadioCard'
import { Plan } from '@/generated/prisma/enums'
import { formatNumber } from '@/utils/pricing'
import { CreateStoreFormValues } from '@/zod/store'

import { Field, FieldError, FieldLabel } from '@/components/ui/field'
import { RadioGroup } from '@/components/ui/radio-group'

import { PLAN_DETAILS } from '../../../../../config/planDetails'

interface PlanSelectorProps {
  isPending: boolean
}

export function PlanSelector({ isPending }: PlanSelectorProps) {
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
      <FieldLabel>เลือกแพ็กเกจเริ่มต้นใช้งาน</FieldLabel>
      <RadioGroup
        value={selectedPlan}
        disabled={isPending}
        onValueChange={(value) => {
          setValue('plan', value as Plan, { shouldValidate: true })
        }}
      >
        <div className="flex flex-col gap-3">
          {(Object.keys(PLAN_DETAILS) as Plan[]).map((key) => {
            const plan = PLAN_DETAILS[key]

            return (
              <RadioCard
                key={key}
                id={`plan-${key}`}
                value={key}
                className={isPending ? 'cursor-not-allowed opacity-60' : ''}
                title={plan.name}
                description={plan.description}
                trailing={
                  <div className="flex items-end gap-1 text-right">
                    <b className="text-primary text-xl">
                      {formatNumber(plan.price)} -.
                    </b>
                    <span className="text-muted-foreground block text-[10px]">
                      /เดือน
                    </span>
                  </div>
                }
              >
                <ul className="grid grid-cols-1 gap-1 sm:grid-cols-2">
                  {plan.features.map((feat, i) => (
                    <li
                      key={i}
                      className="text-muted-foreground flex items-center gap-1.5 text-sm"
                    >
                      <span className="text-primary shrink-0">-</span>
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </RadioCard>
            )
          })}
        </div>
      </RadioGroup>
      <FieldError>{errors?.plan?.message}</FieldError>
    </Field>
  )
}
