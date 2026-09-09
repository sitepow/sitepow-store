'use client'

import { BUYER_NAVIGATION } from '@/constants/navigation'
import { useSession } from '@/hooks/use-session'
import { IconMessages } from '@tabler/icons-react'

import { PageTabHeader } from '@/components/PageTabHeader'
import { ChatInbox } from '@/components/chat/ChatInbox'
import { Sidebar } from '@/components/layout/Sidebar'

export default function StoreUserChatPage() {
  const { user } = useSession()

  return (
    <Sidebar redirectPath="user" items={BUYER_NAVIGATION}>
      <PageTabHeader
        icon={IconMessages}
        title="แชทและข้อความ"
        description="ประวัติการสนทนากับร้านค้าและทีมงานฝ่ายบริการช่วยเหลือ"
      />
      <ChatInbox mode="customer" currentUserId={user?.id || ''} />
    </Sidebar>
  )
}
