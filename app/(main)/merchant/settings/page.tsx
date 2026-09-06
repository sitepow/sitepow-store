'use client'

import { Suspense } from 'react'

import { useTranslations } from 'next-intl'

import { useEmployeePermission } from '@/actions/hooks/employee'
import { MERCHANT_NAVIGATION } from '@/constants/navigation'
import { SettingsTab } from '@/constants/settings'
import { useQueryParam } from '@/hooks/use-query-param'
import { ALL_STORES, useStoreFilter } from '@/stores/use-store-filter'
import {
  IconBell,
  IconBuildingStore,
  IconCreditCard,
  IconLock,
  IconReceiptTax,
  IconReplace,
  IconSettings,
  IconStar,
  IconTruck,
  IconWebhook,
  IconWorld,
} from '@tabler/icons-react'

import { ActionRequiredAlert } from '@/components/ActionRequiredAlert'
import { BranchSelectField } from '@/components/BranchSelectField'
import { PageTabHeader } from '@/components/PageTabHeader'
import { StoreSelectField } from '@/components/StoreSelectField'
import { Sidebar } from '@/components/layout/Sidebar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

import { DomainSettingsForm } from './DomainSettingsForm'
import { NotificationSettingsForm } from './_components/NotificationSettingsForm'
import { PaymentSettingsForm } from './_components/PaymentSettingsForm'
import { ReviewRewardSettingsForm } from './_components/ReviewRewardSettingsForm'
import { SecuritySettingsForm } from './_components/SecuritySettingsForm'
import { ShippingSettingsForm } from './_components/ShippingSettingsForm'
import { StoreProfileForm } from './_components/StoreProfileForm'
import { StoreTransferSettingsForm } from './_components/StoreTransferSettingsForm'
import { TaxSettingsForm } from './_components/TaxSettingsForm'
import { WebhookSettingsForm } from './_components/WebhookSettingsForm'

export const dynamic = 'force-dynamic'

function MerchantSettingsContent() {
  const t = useTranslations('merchant.settings')
  const [activeTab, setActiveTab] = useQueryParam(
    'tab',
    SettingsTab.STORE_PROFILE,
  )

  const { selectedStoreId } = useStoreFilter()
  const {
    canViewStoreProfile,
    canViewDomain,
    canViewSecurity,
    canViewNotifications,
    canViewTransferStore,
    canViewTax,
    canViewShipping,
    canViewPayment,
    canViewReviews,
    canViewStoreSettings,
    isLoading: isPermissionLoading,
  } = useEmployeePermission()

  return (
    <Sidebar redirectPath="merchant" items={MERCHANT_NAVIGATION}>
      <PageTabHeader
        icon={IconSettings}
        title={t('title')}
        description={t('description')}
        endContent={
          <div className="flex flex-wrap gap-2.5">
            <StoreSelectField />
            <BranchSelectField />
          </div>
        }
      />
      {selectedStoreId === ALL_STORES ? (
        <ActionRequiredAlert />
      ) : (
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          orientation="vertical"
          className="flex flex-col gap-6 xl:flex-row"
        >
          <TabsList className="flex h-auto w-full shrink-0 items-stretch justify-start gap-1 rounded-xl border p-1 xl:sticky xl:top-5 xl:w-57.5 xl:flex-col">
            <TabsTrigger value={SettingsTab.STORE_PROFILE}>
              <IconBuildingStore size={14} /> {t('tabs.storeProfile')}
            </TabsTrigger>
            <TabsTrigger value={SettingsTab.DOMAIN}>
              <IconWorld size={14} /> {t('tabs.domain')}
            </TabsTrigger>
            <TabsTrigger value={SettingsTab.SECURITY}>
              <IconLock size={14} /> {t('tabs.security')}
            </TabsTrigger>
            <TabsTrigger value={SettingsTab.NOTIFICATIONS}>
              <IconBell size={14} /> {t('tabs.notifications')}
            </TabsTrigger>
            <TabsTrigger value={SettingsTab.TRANSFER}>
              <IconReplace size={14} /> {t('tabs.transfer')}
            </TabsTrigger>
            <TabsTrigger value={SettingsTab.TAX}>
              <IconReceiptTax size={14} /> {t('tabs.tax')}
            </TabsTrigger>
            <TabsTrigger value={SettingsTab.SHIPPING}>
              <IconTruck size={14} /> {t('tabs.shipping')}
            </TabsTrigger>
            <TabsTrigger value={SettingsTab.PAYMENT}>
              <IconCreditCard size={14} /> {t('tabs.payment')}
            </TabsTrigger>
            <TabsTrigger value={SettingsTab.REVIEW_REWARD}>
              <IconStar size={14} /> {t('tabs.reviewReward')}
            </TabsTrigger>
            <TabsTrigger value={SettingsTab.WEBHOOK}>
              <IconWebhook size={14} /> {t('tabs.webhook')}
            </TabsTrigger>
          </TabsList>
          <TabsContent value={SettingsTab.STORE_PROFILE} className="flex-1">
            {!isPermissionLoading && !canViewStoreProfile ? (
              <ActionRequiredAlert
                icon={<IconLock />}
                title={t('noAccess.title')}
                description={t('noAccess.storeProfile')}
              />
            ) : (
              <StoreProfileForm />
            )}
          </TabsContent>
          <TabsContent value={SettingsTab.DOMAIN} className="flex-1">
            {!isPermissionLoading && !canViewDomain ? (
              <ActionRequiredAlert
                icon={<IconLock />}
                title={t('noAccess.title')}
                description={t('noAccess.domain')}
              />
            ) : (
              <DomainSettingsForm />
            )}
          </TabsContent>
          <TabsContent value={SettingsTab.SECURITY} className="flex-1">
            {!isPermissionLoading && !canViewSecurity ? (
              <ActionRequiredAlert
                icon={<IconLock />}
                title={t('noAccess.title')}
                description={t('noAccess.security')}
              />
            ) : (
              <SecuritySettingsForm />
            )}
          </TabsContent>
          <TabsContent value={SettingsTab.NOTIFICATIONS} className="flex-1">
            {!isPermissionLoading && !canViewNotifications ? (
              <ActionRequiredAlert
                icon={<IconLock />}
                title={t('noAccess.title')}
                description={t('noAccess.notifications')}
              />
            ) : (
              <NotificationSettingsForm />
            )}
          </TabsContent>
          <TabsContent value={SettingsTab.TRANSFER} className="flex-1">
            {!isPermissionLoading && !canViewTransferStore ? (
              <ActionRequiredAlert
                icon={<IconLock />}
                title={t('noAccess.title')}
                description={t('noAccess.transfer')}
              />
            ) : (
              <StoreTransferSettingsForm />
            )}
          </TabsContent>
          <TabsContent value={SettingsTab.TAX} className="flex-1">
            {!isPermissionLoading && !canViewTax ? (
              <ActionRequiredAlert
                icon={<IconLock />}
                title={t('noAccess.title')}
                description={t('noAccess.tax')}
              />
            ) : (
              <TaxSettingsForm />
            )}
          </TabsContent>
          <TabsContent value={SettingsTab.SHIPPING} className="flex-1">
            {!isPermissionLoading && !canViewShipping ? (
              <ActionRequiredAlert
                icon={<IconLock />}
                title={t('noAccess.title')}
                description={t('noAccess.shipping')}
              />
            ) : (
              <ShippingSettingsForm />
            )}
          </TabsContent>
          <TabsContent value={SettingsTab.PAYMENT} className="flex-1">
            {!isPermissionLoading && !canViewPayment ? (
              <ActionRequiredAlert
                icon={<IconLock />}
                title={t('noAccess.title')}
                description={t('noAccess.payment')}
              />
            ) : (
              <PaymentSettingsForm />
            )}
          </TabsContent>
          <TabsContent value={SettingsTab.REVIEW_REWARD} className="flex-1">
            {!isPermissionLoading && !canViewReviews ? (
              <ActionRequiredAlert
                icon={<IconLock />}
                title={t('noAccess.title')}
                description={t('noAccess.reviews')}
              />
            ) : (
              <ReviewRewardSettingsForm />
            )}
          </TabsContent>
          <TabsContent value={SettingsTab.WEBHOOK} className="flex-1">
            {!isPermissionLoading && !canViewStoreSettings ? (
              <ActionRequiredAlert
                icon={<IconLock />}
                title={t('noAccess.title')}
                description={t('noAccess.webhook')}
              />
            ) : (
              <WebhookSettingsForm />
            )}
          </TabsContent>
        </Tabs>
      )}
    </Sidebar>
  )
}

export default function MerchantSettingsPage() {
  return (
    <Suspense fallback={null}>
      <MerchantSettingsContent />
    </Suspense>
  )
}
