'use client'

import React from 'react'

import { ALL_STORES, useStoreFilter } from '@/stores/use-store-filter'
import { IconLock } from '@tabler/icons-react'

import { ActionRequiredAlert } from '@/components/ActionRequiredAlert'

export interface MerchantStoreGuardProps {
  children: React.ReactNode
  isAuthorized?: boolean
  isPermissionLoading?: boolean
  noAccessTitle?: string
  noAccessDescription?: string
}

/**
 * Encapsulates the standard store selection and permission checks for Merchant dashboard pages.
 */
export function MerchantStoreGuard({
  children,
  isAuthorized = true,
  isPermissionLoading = false,
  noAccessTitle,
  noAccessDescription,
}: MerchantStoreGuardProps) {
  const { selectedStoreId } = useStoreFilter()

  if (selectedStoreId === ALL_STORES) {
    return <ActionRequiredAlert />
  }

  if (!isPermissionLoading && !isAuthorized) {
    return (
      <ActionRequiredAlert
        icon={<IconLock />}
        title={noAccessTitle}
        description={noAccessDescription}
      />
    )
  }

  return <>{children}</>
}
