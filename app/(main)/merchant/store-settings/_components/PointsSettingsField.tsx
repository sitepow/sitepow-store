'use client'

import { useEffect } from 'react'
import { useFormContext } from 'react-hook-form'

import { Plan } from '@/generated/prisma/enums'
import { CreateStoreFormValues } from '@/zod/store/create-store'
import { IconLock } from '@tabler/icons-react'

import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Field, FieldError, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'

interface PointsSettingsFieldProps {
  isPending: boolean
}

export function PointsSettingsField({ isPending }: PointsSettingsFieldProps) {
  const {
    register,
    setValue,
    watch,
    formState: { errors },
  } = useFormContext<CreateStoreFormValues>()

  const currentPlan = watch('plan')
  const isPointsEnabled = watch('isPointsEnabled')

  useEffect(() => {
    if (currentPlan !== Plan.ULTIMATE) {
      setValue('isPointsEnabled', false)
    }
  }, [currentPlan, setValue])

  return (
    <>
      <div className="text-muted-foreground border-b pt-2 pb-1 text-sm font-semibold sm:col-span-2">
        5. ระบบสมาชิกและคะแนนสะสม (CRM)
      </div>

      <div className="flex flex-col gap-1 py-1 sm:col-span-2">
        <label
          className={`flex items-center gap-2 text-sm font-medium ${
            currentPlan !== Plan.ULTIMATE
              ? 'text-muted-foreground cursor-not-allowed'
              : 'cursor-pointer'
          }`}
        >
          <Checkbox
            checked={isPointsEnabled}
            onCheckedChange={(checked) =>
              setValue('isPointsEnabled', !!checked)
            }
            disabled={currentPlan !== Plan.ULTIMATE || isPending}
          />
          <span className="flex items-center gap-1.5">
            เปิดใช้งานระบบแต้มสะสมสำหรับร้านค้า
            {currentPlan !== Plan.ULTIMATE && (
              <Badge variant="outline">
                <IconLock />
                เฉพาะ Ultimate แพลนเท่านั้น
              </Badge>
            )}
          </span>
        </label>
        <FieldError>{errors?.isPointsEnabled?.message}</FieldError>
      </div>

      {isPointsEnabled && currentPlan === Plan.ULTIMATE && (
        <div className="bg-muted/40 animate-in slide-in-from-top-2 grid gap-5 rounded-lg border p-4 duration-200 sm:col-span-2 sm:grid-cols-2">
          <Field>
            <FieldLabel>ยอดซื้อเพื่อรับ 1 แต้ม (บาท)</FieldLabel>
            <Input
              type="number"
              placeholder="เช่น ซื้อครบ 100 บาท ได้ 1 แต้ม"
              {...register('pointEarningRate', { valueAsNumber: true })}
              disabled={isPending}
            />
            <FieldError>{errors?.pointEarningRate?.message}</FieldError>
          </Field>

          <Field>
            <FieldLabel>มูลค่าส่วนลดต่อ 1 แต้ม (บาท)</FieldLabel>
            <Input
              type="number"
              placeholder="เช่น 1 แต้ม มีค่าเท่ากับ 1 บาท"
              {...register('pointRedeemRate', { valueAsNumber: true })}
              disabled={isPending}
            />
            <FieldError>{errors?.pointRedeemRate?.message}</FieldError>
          </Field>
        </div>
      )}
    </>
  )
}
