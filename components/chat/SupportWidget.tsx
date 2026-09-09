'use client'

import { useState } from 'react'

import {
  useMarkAsRead,
  useSupportConversations,
  useUnreadCount,
} from '@/actions/hooks/chat'
import { CartBadge } from '@/app/sites/[domain]/_components/cart/CartBadge'
import { useSession } from '@/hooks/use-session'
import { useChatStore } from '@/stores/use-chat-store'
import { MessageCircle, X } from 'lucide-react'

import { Button } from '@/components/ui/button'

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
    <div className="fixed right-4 bottom-4 z-50 flex flex-col items-end gap-3">
      {isOpen && (
        <div className="border-border bg-background animate-in fade-in-0 zoom-in-95 slide-in-from-bottom-4 flex h-[560px] max-h-[calc(100vh-6rem)] w-[380px] max-w-[calc(100vw-2rem)] flex-col overflow-hidden rounded-2xl border shadow-2xl duration-200">
          <SupportHeader
            title={selectedConv?.merchantName || 'แชท Support'}
            hasBack={!!selectedId}
            onBack={() => setSelectedId(null)}
            onClose={() => setIsOpen(false)}
            fullScreenUrl="/merchant/chat"
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
