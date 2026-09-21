'use client'

import { ComponentProps, useEffect } from 'react'
import { useForm } from 'react-hook-form'

import {
  useLoyaltySettings,
  useUpdateLoyaltySettings,
} from '@/actions/hooks/loyalty'
import { useStoreFilter } from '@/stores/use-store-filter'
import {
  UpdateLoyaltySettingsFormValues,
  updateLoyaltySettingsSchema,
} from '@/zod/loyalty'
import { zodResolver } from '@hookform/resolvers/zod'
import { IconDeviceFloppy } from '@tabler/icons-react'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Spinner } from '@/components/ui/spinner'
import { Switch } from '@/components/ui/switch'

import { cn } from '@/lib/utils'

export function LoyaltySettingsCard({
  className,
  ...props
}: ComponentProps<typeof Card>) {
  const { selectedStoreId } = useStoreFilter()
  const { data: settings } = useLoyaltySettings(selectedStoreId)
  const updateLoyaltyMutation = useUpdateLoyaltySettings()

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<UpdateLoyaltySettingsFormValues>({
    resolver: zodResolver(updateLoyaltySettingsSchema),
    defaultValues: {
      isPointsEnabled: false,
      pointEarningRate: null,
      pointRedeemRate: null,
    },
  })

  useEffect(() => {
    if (settings) {
      reset({
        isPointsEnabled: settings.isPointsEnabled,
        pointEarningRate: settings.pointEarningRate
          ? Number(settings.pointEarningRate)
          : null,
        pointRedeemRate: settings.pointRedeemRate
          ? Number(settings.pointRedeemRate)
          : null,
      })
    }
  }, [settings, reset])

  const isPointsEnabled = watch('isPointsEnabled')
  const point = watch('pointRedeemRate')

  const onSubmit = (values: UpdateLoyaltySettingsFormValues) => {
    updateLoyaltyMutation.mutate({
      storeId: selectedStoreId,
      input: values,
    })
  }

  return (
    <Card className={cn('h-fit', className)} {...props}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>เงื่อนไขการคำนวณแต้ม</CardTitle>
          <Switch
            checked={isPointsEnabled}
            onCheckedChange={(v) =>
              setValue('isPointsEnabled', v, { shouldValidate: true })
            }
            disabled={updateLoyaltyMutation.isPending}
          />
        </div>
        <CardDescription>
          เปิดใช้ระบบคะแนนสะสมและกำหนดสัดส่วนมูลค่าเงินเป็นคะแนน
        </CardDescription>
      </CardHeader>
      <CardContent
        className={cn(
          'space-y-5 transition-opacity duration-200',
          !isPointsEnabled && 'pointer-events-none opacity-40 select-none',
        )}
      >
        <div className="space-y-2">
          <Label className="text-xs font-semibold">
            ยอดซื้อขั้นต่ำต่อการรับ 1 แต้ม
          </Label>
          <div className="flex items-center">
            <Input
              type="number"
              min={1}
              className="rounded-r-none"
              {...register('pointEarningRate', { valueAsNumber: true })}
              disabled={updateLoyaltyMutation.isPending}
            />
            <span className="bg-muted text-muted-foreground rounded-r-md border border-l-0 px-3 py-2 text-xs whitespace-nowrap">
              บาท = 1 แต้ม
            </span>
          </div>
          {errors?.pointEarningRate && (
            <p className="text-destructive text-xs">
              {errors.pointEarningRate.message}
            </p>
          )}
        </div>
        <div className="space-y-2">
          <Label className="text-xs font-semibold">
            มูลค่าส่วนลดต่อ 1 แต้ม
          </Label>
          <div className="flex items-center">
            <Input
              type="number"
              min={0.1}
              className="rounded-r-none"
              {...register('pointRedeemRate', { valueAsNumber: true })}
              disabled={updateLoyaltyMutation.isPending}
            />
            <span className="bg-muted text-muted-foreground rounded-r-md border border-l-0 px-3 py-2 text-xs whitespace-nowrap">
              แต้ม = ลด {point} บาท
            </span>
          </div>
          {errors?.pointRedeemRate && (
            <p className="text-destructive text-xs">
              {errors.pointRedeemRate.message}
            </p>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex justify-end border-t pt-3">
        <Button
          size="sm"
          className="gap-1.5 text-xs"
          disabled={updateLoyaltyMutation.isPending}
          onClick={handleSubmit(onSubmit)}
        >
          {updateLoyaltyMutation.isPending ? (
            <>
              <Spinner /> กำลังบันทึก...
            </>
          ) : (
            <>
              <IconDeviceFloppy size={14} /> บันทึกการตั้งค่า
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}
