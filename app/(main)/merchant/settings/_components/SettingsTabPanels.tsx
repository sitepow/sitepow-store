'use client'

import React from 'react'
import { useTranslations } from 'next-intl'
import { IconLock } from '@tabler/icons-react'

import { useEmployeePermission } from '@/actions/hooks/employee'
import { ActionRequiredAlert } from '@/components/ActionRequiredAlert'
import { TabsContent } from '@/components/ui/tabs'
import { SettingsTab } from '@/constants/settings'

import { DomainSettingsForm } from '../DomainSettingsForm'
import { NotificationSettingsForm } from './NotificationSettingsForm'
import { PaymentSettingsForm } from './PaymentSettingsForm'
import { ReviewRewardSettingsForm } from './ReviewRewardSettingsForm'
import { SecuritySettingsForm } from './SecuritySettingsForm'
import { ShippingSettingsForm } from './ShippingSettingsForm'
import { StoreProfileForm } from './StoreProfileForm'
import { StoreTransferSettingsForm } from './StoreTransferSettingsForm'
import { TaxSettingsForm } from './TaxSettingsForm'
import { WebhookSettingsForm } from './WebhookSettingsForm'

interface TabPanelProps {
  value: SettingsTab
  canView: boolean
  isLoading: boolean
  noAccessKey: string
  children: React.ReactNode
}

function ProtectedTabPanel({
  value,
  canView,
  isLoading,
  noAccessKey,
  children,
}: TabPanelProps) {
  const t = useTranslations('merchant.settings')

  return (
    <TabsContent value={value} className="flex-1">
      {!isLoading && !canView ? (
        <ActionRequiredAlert
          icon={<IconLock />}
          title={t('noAccess.title')}
          description={t(`noAccess.${noAccessKey}`)}
        />
      ) : (
        children
      )}
    </TabsContent>
  )
}

export function SettingsTabPanels() {
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
    canViewWebhook,
    isLoading,
  } = useEmployeePermission()

  return (
    <>
      <ProtectedTabPanel
        value={SettingsTab.STORE_PROFILE}
        canView={canViewStoreProfile}
        isLoading={isLoading}
        noAccessKey="storeProfile"
      >
        <StoreProfileForm />
      </ProtectedTabPanel>

      <ProtectedTabPanel
        value={SettingsTab.DOMAIN}
        canView={canViewDomain}
        isLoading={isLoading}
        noAccessKey="domain"
      >
        <DomainSettingsForm />
      </ProtectedTabPanel>

      <ProtectedTabPanel
        value={SettingsTab.SECURITY}
        canView={canViewSecurity}
        isLoading={isLoading}
        noAccessKey="security"
      >
        <SecuritySettingsForm />
      </ProtectedTabPanel>

      <ProtectedTabPanel
        value={SettingsTab.NOTIFICATIONS}
        canView={canViewNotifications}
        isLoading={isLoading}
        noAccessKey="notifications"
      >
        <NotificationSettingsForm />
      </ProtectedTabPanel>

      <ProtectedTabPanel
        value={SettingsTab.TRANSFER}
        canView={canViewTransferStore}
        isLoading={isLoading}
        noAccessKey="transfer"
      >
        <StoreTransferSettingsForm />
      </ProtectedTabPanel>

      <ProtectedTabPanel
        value={SettingsTab.TAX}
        canView={canViewTax}
        isLoading={isLoading}
        noAccessKey="tax"
      >
        <TaxSettingsForm />
      </ProtectedTabPanel>

      <ProtectedTabPanel
        value={SettingsTab.SHIPPING}
        canView={canViewShipping}
        isLoading={isLoading}
        noAccessKey="shipping"
      >
        <ShippingSettingsForm />
      </ProtectedTabPanel>

      <ProtectedTabPanel
        value={SettingsTab.PAYMENT}
        canView={canViewPayment}
        isLoading={isLoading}
        noAccessKey="payment"
      >
        <PaymentSettingsForm />
      </ProtectedTabPanel>

      <ProtectedTabPanel
        value={SettingsTab.REVIEW_REWARD}
        canView={canViewReviews}
        isLoading={isLoading}
        noAccessKey="reviews"
      >
        <ReviewRewardSettingsForm />
      </ProtectedTabPanel>

      <ProtectedTabPanel
        value={SettingsTab.WEBHOOK}
        canView={canViewWebhook}
        isLoading={isLoading}
        noAccessKey="webhook"
      >
        <WebhookSettingsForm />
      </ProtectedTabPanel>
    </>
  )
}

