'use client'

import { useState } from 'react'
import { FormProvider, useForm } from 'react-hook-form'

import { useCheckout } from '@/actions/hooks/checkout'
import { useCreateStore } from '@/actions/hooks/store'
import { usePricingStore } from '@/app/(main)/pricing/store'
import { Plan } from '@/generated/prisma/enums'
import { useSession } from '@/hooks/use-session'
import { CheckoutType } from '@/types/checkout'
import { formatSlug } from '@/utils/slug'
import { CreateStoreFormValues, createStoreSchema } from '@/zod/store'
import { zodResolver } from '@hookform/resolvers/zod'
import { IconPlus } from '@tabler/icons-react'

import { MerchantPricingTabs } from '@/components/MerchantPricingTabs'
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

import { PlanSelector } from './PlanSelector'
import { StoreNameField } from './StoreNameField'
import { StoreSlugField } from './StoreSlugField'

export function StoreCreateDialog() {
  const { selectedTab } = usePricingStore()
  const { user } = useSession()
  const [open, setOpen] = useState(false)
  const createStoreMutation = useCreateStore()
  const checkoutMutation = useCheckout()

  const methods = useForm<CreateStoreFormValues>({
    resolver: zodResolver(createStoreSchema),
    defaultValues: {
      name: '',
      slug: '',
      description: '',
      phone: '',
      lineId: '',
      facebookPage: '',
      taxId: '',
      isVatRegistered: false,
      vatRate: 7.0,
      isPointsEnabled: true,
      pointEarningRate: 100,
      pointRedeemRate: 0.35,
      plan: Plan.FREE,
    },
  })

  const { handleSubmit, reset } = methods

  const handleClose = () => {
    reset()
    setOpen(false)
  }

  const onSubmit = (values: CreateStoreFormValues) => {
    createStoreMutation.mutate(
      {
        ...values,
        billingCycle: selectedTab,
        slug: formatSlug(values.slug),
        ownerId: user?.id ?? '',
      },
      {
        onSuccess: (data) => {
          if (data.success && data.invoice) {
            checkoutMutation.mutate({
              amount: Number(data.invoice.amount),
              description: data.invoice.description!,
              successUrl: `${window.location.origin}/merchant/billing-subscription`,
              cancelUrl: `${window.location.origin}/merchant/billing-subscription`,
              metadata: {
                type: CheckoutType.SUBSCRIPTION,
                relatedId: data.invoice.id,
                storeId: data.data.id,
              },
            })
          } else {
            handleClose()
          }
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
        <Button variant="outline">
          <IconPlus />
          สร้างร้านค้าใหม่
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader className="space-y-2">
          <DialogTitle>เริ่มต้นสร้างร้านค้าใหม่</DialogTitle>
          <DialogDescription>
            กรอกข้อมูลพื้นฐานและตั้งค่าระบบของร้านค้าเพื่อเริ่มต้นขายสินค้าออนไลน์
          </DialogDescription>
        </DialogHeader>
        <FormProvider {...methods}>
          <div className="grid gap-5 sm:grid-cols-2">
            <div className="text-muted-foreground border-b pb-1 text-sm font-semibold sm:col-span-2">
              1. เลือกแพลนการใช้งานของคุณ
            </div>
            <div className="flex flex-col items-center gap-5 sm:col-span-2">
              <MerchantPricingTabs />
              <PlanSelector isPending={createStoreMutation.isPending} />
            </div>
            <div className="text-muted-foreground border-b pt-2 pb-1 text-sm font-semibold sm:col-span-2">
              2. ข้อมูลทั่วไปของร้านค้า
            </div>
            <StoreNameField isPending={createStoreMutation.isPending} />
            <StoreSlugField isPending={createStoreMutation.isPending} />
          </div>
        </FormProvider>
        <DialogFooter className="mt-5 flex gap-2 border-t pt-4">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={createStoreMutation.isPending}
          >
            ยกเลิก
          </Button>
          <Button
            disabled={createStoreMutation.isPending}
            onClick={handleSubmit(onSubmit)}
          >
            {createStoreMutation.isPending ? (
              <>
                <Spinner /> กำลังสร้างร้านค้า...
              </>
            ) : (
              'สร้างร้านค้าของคุณ'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
