'use client'

import { useEffect } from 'react'

import {
  useConversation,
  useMarkAsRead,
  useOrCreateStoreConversation,
  useUnreadCount,
} from '@/actions/hooks/chat'
import { CartBadge } from '@/app/sites/[domain]/_components/cart/CartBadge'
import { ConversationType } from '@/generated/prisma/enums'
import { useSession } from '@/hooks/use-session'
import { useChatStore } from '@/stores/use-chat-store'
import { MessageCircle, X } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

import { AlertChat } from './_components/AlertChat'
import { ChatWindow } from './_components/ChatWindow'

interface ChatWidgetProps {
  conversationType: ConversationType
  storeId?: string
}

export function ChatWidget({ conversationType, storeId }: ChatWidgetProps) {
  const { userId, isAuthenticated } = useSession()
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

  return (
    <div className="fixed right-4 bottom-4 z-50 flex flex-col items-end gap-2">
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="flex h-[80vh] flex-col gap-1 overflow-hidden p-0 sm:max-w-md">
          <DialogHeader className="border-b p-4">
            <DialogTitle>แชท Support</DialogTitle>
          </DialogHeader>
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
        </DialogContent>
      </Dialog>
      <Button
        onClick={toggleChat}
        size="icon-lg"
        className="relative size-14 shadow-lg"
        aria-label={isOpen ? 'ปิดหน้าต่างแชทช่วยเหลือ' : 'เปิดหน้าต่างแชทช่วยเหลือ'}
      >
        {isOpen ? <X aria-hidden="true" /> : <MessageCircle aria-hidden="true" />}
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
