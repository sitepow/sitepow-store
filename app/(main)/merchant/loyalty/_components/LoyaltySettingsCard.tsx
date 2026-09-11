'use client'

import { useCurrentStore } from '@/hooks/use-current-store'

import { ComponentProps, useEffect } from 'react'
import { useForm } from 'react-hook-form'

import { useTranslations } from 'next-intl'

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
  const { currentStore, store } = useCurrentStore()
  const t = useTranslations('merchant.loyalty.settings')
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
    <Card
      style={{
        '--primary': currentStore?.primaryColor ?? store?.primaryColor,
      } as React.CSSProperties} className={cn('h-fit', className)} {...props}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>{t('title')}</CardTitle>
          <Switch
            checked={isPointsEnabled}
            onCheckedChange={(v) =>
              setValue('isPointsEnabled', v, { shouldValidate: true })
            }
            disabled={updateLoyaltyMutation.isPending}
          />
        </div>
        <CardDescription>{t('description')}</CardDescription>
      </CardHeader>
      <CardContent
        className={cn(
          'space-y-5 transition-opacity duration-200',
          !isPointsEnabled && 'pointer-events-none opacity-40 select-none',
        )}
      >
        <div className="space-y-2">
          <Label className="text-xs font-semibold">
            {t('earningRateLabel')}
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
              {t('earningRateUnit')}
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
            {t('redeemRateLabel')}
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
              {t('redeemRateUnit', { discount: point ?? 0 })}
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
              <Spinner /> {t('saving')}
            </>
          ) : (
            <>
              <IconDeviceFloppy size={14} /> {t('save')}
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}
