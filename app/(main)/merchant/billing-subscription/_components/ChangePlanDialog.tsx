'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'

import { useChangePlan } from '@/actions/hooks/subscription'
import { RadioCard } from '@/app/sites/[domain]/cart/_components/RadioCard'
import { PLAN_DETAILS } from '@/config/planDetails'
import { Plan } from '@/generated/prisma/enums'
import { formatNumber } from '@/utils/pricing'
import { ChangePlanFormValues, changePlanSchema } from '@/zod/subscription'
import { zodResolver } from '@hookform/resolvers/zod'
import { IconSettings } from '@tabler/icons-react'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Field, FieldError } from '@/components/ui/field'
import { RadioGroup } from '@/components/ui/radio-group'
import { Spinner } from '@/components/ui/spinner'

interface ChangePlanDialogProps {
  storeId: string
  currentPlan: Plan
}

export function ChangePlanDialog({
  storeId,
  currentPlan,
}: ChangePlanDialogProps) {
  const [open, setOpen] = useState(false)
  const changePlanMutation = useChangePlan()

  const {
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<ChangePlanFormValues>({
    resolver: zodResolver(changePlanSchema),
    defaultValues: {
      plan: currentPlan,
    },
  })

  const selectedPlan = watch('plan')

  const handleClose = () => {
    reset()
    setOpen(false)
  }

  const onSubmit = (values: ChangePlanFormValues) => {
    changePlanMutation.mutate(
      { storeId, plan: values.plan },
      {
        onSuccess: () => {
          handleClose()
        },
      },
    )
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) {
          handleClose()
        } else {
          setOpen(v)
        }
      }}
    >
      <DialogTrigger asChild>
        <Button variant="outline" size="icon-lg">
          <IconSettings />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>เปลี่ยนแพลนการใช้งาน</DialogTitle>
          <DialogDescription>
            เลือกแพลนที่เหมาะสมกับความต้องการของร้านค้าคุณ
          </DialogDescription>
        </DialogHeader>

        <Field className="space-y-3">
          <RadioGroup
            value={selectedPlan}
            disabled={changePlanMutation.isPending}
            onValueChange={(v) =>
              setValue('plan', v as Plan, { shouldValidate: true })
            }
          >
            <div className="grid gap-3 sm:grid-cols-2">
              {(Object.keys(PLAN_DETAILS) as Plan[]).map((key) => {
                const plan = PLAN_DETAILS[key]

                return (
                  <RadioCard
                    key={key}
                    id={`plan-${key}`}
                    value={key}
                    className={
                      changePlanMutation.isPending
                        ? 'cursor-not-allowed opacity-60'
                        : ''
                    }
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
                    <div className="text-muted-foreground text-xs">
                      {plan.features.join(', ')}
                    </div>
                  </RadioCard>
                )
              })}
            </div>
          </RadioGroup>
          <FieldError>{errors?.plan?.message}</FieldError>
        </Field>

        <DialogFooter className="mt-2 flex gap-2 border-t pt-4">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={changePlanMutation.isPending}
          >
            ยกเลิก
          </Button>
          <Button
            onClick={handleSubmit(onSubmit)}
            disabled={changePlanMutation.isPending}
          >
            {changePlanMutation.isPending ? (
              <>
                <Spinner /> กำลังบันทึก...
              </>
            ) : (
              'ยืนยันการเปลี่ยนแพลน'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
