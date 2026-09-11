'use client'

import { useState } from 'react'
import { FormProvider, useForm } from 'react-hook-form'

import { useTranslations } from 'next-intl'
import { useRouter } from 'next/navigation'

import {
  useChangePlan,
  useInitiatePlanUpgrade,
  useUpgradeCost,
} from '@/actions/hooks/subscription'
import { usePricingStore } from '@/app/(main)/pricing/store'
import { Plan } from '@/generated/prisma/enums'
import { UpgradeType } from '@/types/checkout'
import { formatCurrency } from '@/utils/pricing'
import { ChangePlanFormValues, changePlanSchema } from '@/zod/subscription'
import { zodResolver } from '@hookform/resolvers/zod'
import { IconSettings } from '@tabler/icons-react'

import { DialogHeaderIcon } from '@/components/DialogHeaderIcon'
import { MerchantPricingTabs } from '@/components/MerchantPricingTabs'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTrigger,
} from '@/components/ui/dialog'

import { PlanSelector } from '../../store-settings/_components/PlanSelector'

interface ChangePlanDialogProps {
  storeId: string
  currentPlan: Plan
}

export function ChangePlanDialog({
  storeId,
  currentPlan,
}: ChangePlanDialogProps) {
  const t = useTranslations('merchant.billing.dialog')
  const tCommon = useTranslations('common.actions')
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const initiateUpgradeMutation = useInitiatePlanUpgrade()
  const changePlanMutation = useChangePlan()

  const { selectedTab } = usePricingStore()

  const methods = useForm<ChangePlanFormValues>({
    resolver: zodResolver(changePlanSchema),
    defaultValues: {
      plan: currentPlan,
    },
  })

  const { handleSubmit, reset, watch } = methods
  const selectedPlan = watch('plan')

  const { data: costData } = useUpgradeCost({
    storeId,
    newPlan: selectedPlan,
    billingCycle: selectedTab,
  })

  const upgradeCost = costData?.amountToPay ?? 0

  const handleClose = () => {
    reset()
    setOpen(false)
  }

  const onSubmit = async (values: ChangePlanFormValues) => {
    const result = await initiateUpgradeMutation.mutateAsync({
      storeId,
      newPlan: values.plan,
      billingCycle: selectedTab,
    })

    if (result.type === UpgradeType.UPGRADE && result.url) {
      router.push(result.url)
    } else {
      await changePlanMutation.mutateAsync({
        storeId,
        plan: values.plan,
        billingCycle: selectedTab,
      })
      handleClose()
    }
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
          <DialogHeaderIcon
            icon={IconSettings}
            title={t('title')}
            description={t('description')}
          />
        </DialogHeader>
        <FormProvider {...methods}>
          <div className="flex flex-col items-center gap-5">
            <MerchantPricingTabs />
            <PlanSelector isPending={changePlanMutation.isPending} />
          </div>
        </FormProvider>
        <DialogFooter className="mt-2 flex w-full gap-2 border-t pt-4">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={changePlanMutation.isPending}
          >
            {tCommon('cancel')}
          </Button>
          <Button onClick={handleSubmit(onSubmit)}>
            {upgradeCost > 0
              ? t('confirmWithExtra', {
                  extra: formatCurrency(upgradeCost),
                })
              : t('confirm')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
