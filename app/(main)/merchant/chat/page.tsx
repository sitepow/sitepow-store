'use client'

import { useTranslations } from 'next-intl'

import { useEmployeePermission } from '@/actions/hooks/employee'
import { MERCHANT_NAVIGATION, SUPPORT_NAVIGATION } from '@/constants/navigation'
import { UserRole } from '@/generated/prisma/enums'
import { useSession } from '@/hooks/use-session'
import { ALL_STORES, useStoreFilter } from '@/stores/use-store-filter'
import { IconLock, IconMessages } from '@tabler/icons-react'

import { ActionRequiredAlert } from '@/components/ActionRequiredAlert'
import { PageTabHeader } from '@/components/PageTabHeader'
import { StoreSelectField } from '@/components/StoreSelectField'
import { ChatInbox } from '@/components/chat/ChatInbox'
import { Sidebar } from '@/components/layout/Sidebar'

export default function MerchantChatPage() {
  const t = useTranslations('merchant.chat')
  const { user } = useSession()
  const { selectedStoreId } = useStoreFilter()
  const { canViewConversation, isLoading: isPermissionLoading } =
    useEmployeePermission()

  const isSupport = user?.role === UserRole.SUPPORT
  const navItems = isSupport ? SUPPORT_NAVIGATION : MERCHANT_NAVIGATION

  const hasAccess =
    isSupport ||
    user?.role === UserRole.MERCHANT ||
    selectedStoreId === ALL_STORES ||
    canViewConversation

  return (
    <Sidebar redirectPath="merchant" items={navItems}>
      <PageTabHeader
        icon={IconMessages}
        title={t('title')}
        description={t('description')}
        endContent={!isSupport ? <StoreSelectField /> : null}
      />

      {!hasAccess && !isPermissionLoading ? (
        <ActionRequiredAlert
          icon={<IconLock />}
          title={t('noAccessTitle')}
          description={t('noAccessDescription')}
        />
      ) : (
        <ChatInbox
          mode={isSupport ? 'support' : 'merchant'}
          storeId={selectedStoreId}
          currentUserId={user?.id || ''}
        />
      )}
    </Sidebar>
  )
}
