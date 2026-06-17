'use client'

import { useConversation, useUnreadCount } from '@/actions/hooks/chat'
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

import { ChatWindow } from './chat-window'

export function ChatWidget() {
  const { userId } = useSession()
  const { isOpen, setIsOpen, toggleChat } = useChatStore()
  const { data: unreadCount = 0 } = useUnreadCount(!!userId)
  const { data } = useConversation(userId!, ConversationType.SUPPORT, isOpen)

  return (
    <div className="fixed right-4 bottom-4 z-50 flex flex-col items-end gap-2">
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="flex h-[80vh] flex-col gap-1 overflow-hidden p-0 sm:max-w-md">
          <DialogHeader className="border-b p-4">
            <DialogTitle>แชท Support</DialogTitle>
          </DialogHeader>

          <div className="flex-1 overflow-hidden">
            {data?.success && data.data && (
              <ChatWindow
                currentUserId={userId!}
                conversationId={data.data.id}
              />
            )}
          </div>
        </DialogContent>
      </Dialog>

      <Button
        onClick={toggleChat}
        size="icon-lg"
        className="relative size-14 shadow-lg"
      >
        {isOpen ? <X /> : <MessageCircle />}
        {unreadCount > 0 && (
          <CartBadge
            className="text-primary bg-background border-primary border"
            total={unreadCount}
          />
        )}
      </Button>
    </div>
  )
}
