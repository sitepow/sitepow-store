'use client'

import { useEffect } from 'react'

import {
  useConversation,
  useMarkAsRead,
  useOrCreateStoreConversation,
  useUnreadCount,
} from '@/actions/hooks/chat'
import { CartBadge } from '@/app/sites/[domain]/_components/cart/CartBadge'
import { ConversationType, UserRole } from '@/generated/prisma/enums'
import { useSession } from '@/hooks/use-session'
import { useChatStore } from '@/stores/use-chat-store'
import { MessageCircle, X } from 'lucide-react'

import { Button } from '@/components/ui/button'

import { AlertChat } from './_components/AlertChat'
import { ChatWindow } from './_components/ChatWindow'
import { SupportHeader } from './_components/SupportHeader'

interface ChatWidgetProps {
  conversationType: ConversationType
  storeId?: string
}

export function ChatWidget({ conversationType, storeId }: ChatWidgetProps) {
  const { userId, isAuthenticated, userRole } = useSession()
  const { isOpen, setIsOpen, toggleChat } = useChatStore()

  const { mutate: createChat, data: chatData } = useOrCreateStoreConversation(
    storeId!,
  )
  const { data: unreadCount = 0 } = useUnreadCount(userId!)

  useEffect(() => {
    if (isOpen && storeId && !chatData) {
      createChat()
    }
  }, [isOpen, chatData, createChat, storeId])

  const { data: convData } = useConversation(
    userId!,
    conversationType,
    !!userId && isOpen,
    storeId,
  )

  const { mutate: markAsRead } = useMarkAsRead()

  useEffect(() => {
    if (isOpen && convData?.success && convData.data?.id) {
      markAsRead(convData.data.id)
    }
  }, [isOpen, convData?.success, convData?.data?.id, markAsRead])

  const headerTitle =
    conversationType === ConversationType.STORE
      ? 'แชทติดต่อร้านค้า'
      : 'แชทฝ่ายบริการลูกค้า'

  return (
    <div className="fixed right-4 bottom-4 z-50 flex flex-col items-end gap-3">
      {isOpen && (
        <div className="border-border bg-background animate-in fade-in-0 zoom-in-95 slide-in-from-bottom-4 flex h-[560px] max-h-[calc(100vh-6rem)] w-[380px] max-w-[calc(100vw-2rem)] flex-col overflow-hidden rounded-2xl border shadow-2xl duration-200">
          <SupportHeader
            title={headerTitle}
            onClose={() => setIsOpen(false)}
            fullScreenUrl={
              isAuthenticated
                ? userRole === UserRole.MERCHANT ||
                  userRole === UserRole.SUPPORT
                  ? '/merchant/chat'
                  : '/user/chat'
                : undefined
            }
          />
          {!isAuthenticated && (
            <AlertChat title="กรุณาเข้าสู่ระบบก่อนเริ่มการสนทนา" />
          )}
          {isAuthenticated && (
            <div className="flex-1 overflow-hidden">
              {userId && convData?.success && convData.data && (
                <ChatWindow
                  currentUserId={userId}
                  conversationId={convData.data.id}
                  isAiEnabled={convData.data.isAiEnabled}
                />
              )}
            </div>
          )}
        </div>
      )}
      <Button
        onClick={toggleChat}
        size="icon-lg"
        className="relative size-14 rounded-full shadow-xl transition-transform hover:scale-105 active:scale-95"
      >
        {isOpen ? (
          <X className="size-6" />
        ) : (
          <MessageCircle className="size-6" />
        )}
        {unreadCount > 0 && (
          <CartBadge
            className="border-primary text-primary border bg-white"
            total={unreadCount}
          />
        )}
      </Button>
    </div>
  )
}
