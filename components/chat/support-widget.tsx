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
import { IconSparkles2 } from '@tabler/icons-react'
import { ArrowLeft, Headset, User2, X } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

import { Avatar, AvatarBadge, AvatarFallback } from '../ui/avatar'
import { AlertChat } from './_components/AlertChat'
import { LoadingChat } from './_components/LoadingChat'
import { ChatWindow } from './chat-window'

function formatRelativeTime(date: Date): string {
  const diffMs = Date.now() - date.getTime()
  const diffMin = Math.floor(diffMs / 60000)

  if (diffMin < 1) {
    return 'เมื่อสักครู่'
  }
  if (diffMin < 60) {
    return `${diffMin} นาทีที่แล้ว`
  }

  const diffHour = Math.floor(diffMin / 60)
  if (diffHour < 24) {
    return `${diffHour} ชั่วโมงที่แล้ว`
  }

  const diffDay = Math.floor(diffHour / 24)
  return `${diffDay} วันที่แล้ว`
}

export function SupportWidget({ storeId }: { storeId?: string } = {}) {
  const { userId } = useSession()
  const { isOpen, setIsOpen, toggleChat } = useChatStore()
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const { data, isLoading } = useSupportConversations(isOpen, storeId)
  const { data: unreadCount = 0 } = useUnreadCount(userId!)

  const { mutate: markAsRead } = useMarkAsRead(userId!)

  const conversations = data?.success && data.data ? data.data : []
  const selectedConversation = conversations.find((c) => c.id === selectedId)

  const handleSelectConversation = (id: string) => {
    setSelectedId(id)
    markAsRead(id)
  }

  const handleClose = () => {
    setIsOpen(false)
    setSelectedId(null)
  }

  return (
    <div className="fixed right-4 bottom-4 z-50">
      <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
        <DialogContent className="flex h-[80vh] w-100 flex-col gap-0 overflow-hidden p-0">
          <DialogHeader className="flex shrink-0 flex-row items-center justify-between space-y-0 border-b p-4">
            <DialogTitle className="flex items-center gap-2 text-lg">
              {selectedId && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-7"
                  onClick={() => setSelectedId(null)}
                >
                  <ArrowLeft className="size-4" />
                </Button>
              )}
              {selectedConversation
                ? selectedConversation.merchantName
                : 'แชท Support'}
            </DialogTitle>
            <Button
              variant="ghost"
              size="icon"
              className="size-8"
              onClick={handleClose}
            >
              <X className="size-4" />
            </Button>
          </DialogHeader>

          <div className="flex-1 overflow-hidden">
            {selectedId && selectedConversation ? (
              <ChatWindow
                currentUserId={userId!}
                conversationId={selectedId}
                otherUserId={selectedConversation.merchantId}
                isAiEnabled={selectedConversation.isAiEnabled}
              />
            ) : (
              <div className="flex h-full flex-col overflow-y-auto">
                {isLoading && <LoadingChat />}

                {!isLoading && conversations.length === 0 && (
                  <AlertChat title="ยังไม่มีแชทเข้ามา" />
                )}

                {conversations.map((conv) => (
                  <button
                    key={conv.id}
                    onClick={() => handleSelectConversation(conv.id)}
                    className="flex w-full flex-col gap-1 border-b p-4 text-left transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <Avatar className="size-8 border">
                        <AvatarFallback>
                          <User2 size={16} />
                        </AvatarFallback>
                        {conv.isAiEnabled && (
                          <AvatarBadge>
                            <IconSparkles2 />
                          </AvatarBadge>
                        )}
                      </Avatar>

                      <div className="flex w-full items-center justify-between">
                        <div className="flex flex-col space-y-1">
                          <p className="text-sm font-medium">
                            {conv.merchantName}
                          </p>

                          <p className="text-muted-foreground line-clamp-2 text-sm">
                            {conv.lastMessage ?? 'ยังไม่มีข้อความ'}
                          </p>

                          <p className="text-muted-foreground text-[10px]">
                            {formatRelativeTime(new Date(conv.lastMessageAt))}
                          </p>
                        </div>

                        {conv.unreadCount > 0 && (
                          <span className="bg-primary text-primary-foreground flex size-6 shrink-0 items-center justify-center rounded-full text-[10px]">
                            {conv.unreadCount}
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
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
      >
        {isOpen ? <X /> : <Headset />}
        {unreadCount > 0 && (
          <CartBadge
            className="text-primary border-primary border bg-white"
            total={unreadCount}
          />
        )}
      </Button>
    </div>
  )
}
