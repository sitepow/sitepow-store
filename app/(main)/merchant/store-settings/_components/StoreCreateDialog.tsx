'use client'

import { useCurrentStore } from '@/hooks/use-current-store'

import { useState } from 'react'
import { FormProvider, useForm } from 'react-hook-form'

import { useTranslations } from 'next-intl'

import { useCheckout } from '@/actions/hooks/checkout'
import { useCreateStore } from '@/actions/hooks/store'
import { usePricingStore } from '@/app/(main)/pricing/store'
import { Plan } from '@/generated/prisma/enums'
import { useSession } from '@/hooks/use-session'
import { CheckoutType } from '@/types/checkout'
import { formatSlug } from '@/utils/slug'
import { CreateStoreFormValues, createStoreSchema } from '@/zod/store'
import { zodResolver } from '@hookform/resolvers/zod'
import { IconBuildingStore, IconPlus } from '@tabler/icons-react'

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
import { Spinner } from '@/components/ui/spinner'

import { PlanSelector } from './PlanSelector'
import { StoreNameField } from './StoreNameField'
import { StoreSlugField } from './StoreSlugField'

export function StoreCreateDialog() {
  const { currentStore, store } = useCurrentStore()
  const t = useTranslations('merchant.stores')
  const tDialog = useTranslations('merchant.stores.dialog')
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
              customerEmail: user?.email ?? '',
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
        <Button variant="outline" disabled={!user?.emailVerified}>
          <IconPlus />
          {t('createStore')}
        </Button>
      </DialogTrigger>
      <DialogContent
        style={{
          '--primary': currentStore?.primaryColor ?? store?.primaryColor,
        } as React.CSSProperties} className="sm:max-w-2xl">
        <DialogHeader>
          <DialogHeaderIcon
            icon={IconBuildingStore}
            title={tDialog('title')}
            description={tDialog('description')}
          />
        </DialogHeader>
        <FormProvider {...methods}>
          <div className="grid gap-5 sm:grid-cols-2">
            <div className="text-muted-foreground border-b pb-1 text-sm font-semibold sm:col-span-2">
              {tDialog('step1')}
            </div>
            <div className="flex flex-col items-center gap-5 sm:col-span-2">
              <MerchantPricingTabs />
              <PlanSelector isPending={createStoreMutation.isPending} />
            </div>
            <div className="text-muted-foreground border-b pt-2 pb-1 text-sm font-semibold sm:col-span-2">
              {tDialog('step2')}
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
            {tDialog('cancel')}
          </Button>
          <Button
            disabled={createStoreMutation.isPending}
            onClick={handleSubmit(onSubmit)}
          >
            {createStoreMutation.isPending ? (
              <>
                <Spinner /> {tDialog('creating')}
              </>
            ) : (
              tDialog('submit')
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
