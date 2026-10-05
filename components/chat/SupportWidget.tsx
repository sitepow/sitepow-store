'use client'

import { useState } from 'react'

import {
  useMarkAsRead,
  useSupportConversations,
  useUnreadCount,
} from '@/actions/chat/chat/hooks'
import { CartBadge } from '@/app/sites/[domain]/_components/cart/CartBadge'
import { useSession } from '@/hooks/use-session'
import { useChatStore } from '@/stores/ui/use-chat-store'
import { MessageCircle, X } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Dialog, DialogContent } from '@/components/ui/dialog'

import { AlertChat } from './_components/AlertChat'
import { ChatWindow } from './_components/ChatWindow'
import { ConversationItem } from './_components/ConversationItem'
import { LoadingChat } from './_components/LoadingChat'
import { SupportHeader } from './_components/SupportHeader'

export function SupportWidget({ storeId }: { storeId?: string } = {}) {
  const { userId } = useSession()
  const { isOpen, setIsOpen, toggleChat } = useChatStore()
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const { data: unreadCount = 0 } = useUnreadCount(userId!)
  const { data, isLoading } = useSupportConversations(isOpen, storeId)
  const { mutate: markAsRead } = useMarkAsRead()

  const conversations = data?.success && data.data ? data.data : []
  const selectedConv = conversations.find((c) => c.id === selectedId)

  return (
    <div className="fixed right-4 bottom-4 z-50">
      <Dialog open={isOpen} onOpenChange={(o) => !o && setIsOpen(false)}>
        <DialogContent className="flex h-[80vh] flex-col gap-0 overflow-hidden p-0 sm:max-w-md">
          <SupportHeader
            title={selectedConv?.merchantName || 'แชท Support'}
            hasBack={!!selectedId}
            onBack={() => setSelectedId(null)}
            onClose={() => setIsOpen(false)}
          />
          <div className="flex-1 overflow-hidden">
            {selectedId && selectedConv ? (
              <ChatWindow
                currentUserId={userId!}
                conversationId={selectedId}
                isAiEnabled={selectedConv.isAiEnabled}
                canToggleAi
              />
            ) : (
              <div className="flex h-full flex-col overflow-y-auto">
                {isLoading && <LoadingChat />}
                {!isLoading && conversations.length === 0 && (
                  <AlertChat title="ยังไม่มีแชทเข้ามา" />
                )}
                {conversations.map((conv) => (
                  <ConversationItem
                    key={conv.id}
                    conv={conv}
                    onClick={() => {
                      setSelectedId(conv.id)
                      markAsRead(conv.id)
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
      <Button
        onClick={toggleChat}
        size="icon-lg"
        className="relative size-14 shadow-lg"
        aria-label={isOpen ? 'ปิดหน้าต่างแชทซัพพอร์ต' : 'เปิดหน้าต่างแชทซัพพอร์ต'}
      >
        {isOpen ? <X aria-hidden="true" /> : <MessageCircle aria-hidden="true" />}
        {unreadCount > 0 && (
          <CartBadge
            className="border-primary text-primary border bg-background"
            total={unreadCount}
          />
        )}
      </Button>
    </div>
  )
}
