'use client'

import { useState } from 'react'
import { FormProvider, useForm } from 'react-hook-form'

import { useRouter } from 'next/navigation'

import {
  useChangePlan,
  useInitiatePlanUpgrade,
} from '@/actions/hooks/subscription'
import { PricingTabs } from '@/app/(main)/pricing/_components/PricingTabs'
import { usePricingStore } from '@/app/(main)/pricing/store'
import { Plan } from '@/generated/prisma/enums'
import { UpgradeType } from '@/types/checkout'
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
import { Spinner } from '@/components/ui/spinner'

import { PlanSelector } from '../../store-settings/_components/PlanSelector'

interface ChangePlanDialogProps {
  storeId: string
  currentPlan: Plan
}

export function ChangePlanDialog({
  storeId,
  currentPlan,
}: ChangePlanDialogProps) {
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

  const { handleSubmit, reset } = methods

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
          <DialogTitle>เปลี่ยนแพลนการใช้งาน</DialogTitle>
          <DialogDescription>
            เลือกแพลนที่เหมาะสมกับความต้องการของร้านค้าคุณ
          </DialogDescription>
        </DialogHeader>
        <FormProvider {...methods}>
          <div className="flex flex-col items-center gap-5">
            <PricingTabs />
            <PlanSelector isPending={changePlanMutation.isPending} />
          </div>
        </FormProvider>
        <DialogFooter className="mt-2 flex w-full gap-2 border-t pt-4">
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
