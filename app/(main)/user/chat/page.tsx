'use client'

import { useEffect } from 'react'

import { useRouter } from 'next/navigation'

import { BUYER_NAVIGATION } from '@/constants/navigation'
import { UserRole } from '@/generated/prisma/enums'
import { useSession } from '@/hooks/use-session'
import { IconMessages } from '@tabler/icons-react'

import { PageTabHeader } from '@/components/PageTabHeader'
import { ChatInbox } from '@/components/chat/ChatInbox'
import { Sidebar } from '@/components/layout/Sidebar'

export default function MainUserChatPage() {
  const router = useRouter()
  const { user, userRole, isLoading } = useSession()

  useEffect(() => {
    if (
      !isLoading &&
      (userRole === UserRole.MERCHANT || userRole === UserRole.SUPPORT)
    ) {
      router.replace('/merchant/chat')
    }
  }, [userRole, isLoading, router])

  if (
    isLoading ||
    userRole === UserRole.MERCHANT ||
    userRole === UserRole.SUPPORT
  ) {
    return null
  }

  return (
    <Sidebar redirectPath="user" items={BUYER_NAVIGATION}>
      <PageTabHeader
        icon={IconMessages}
        title="แชทและข้อความ"
        description="ประวัติการสนทนากับร้านค้าและฝ่ายบริการช่วยเหลือ"
      />
      <ChatInbox mode="customer" currentUserId={user?.id || ''} />
    </Sidebar>
  )
}
