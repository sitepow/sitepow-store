'use client'

import { useState } from 'react'

import { useSupportConversations } from '@/actions/hooks/chat'
import { useSession } from '@/hooks/use-session'
import { useChatStore } from '@/stores/use-chat-store'
import { IconAlertCircle, IconSparkles2 } from '@tabler/icons-react'
import { ArrowLeft, Headset, User2, X } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

import { Avatar, AvatarBadge, AvatarFallback } from '../ui/avatar'
import { Spinner } from '../ui/spinner'
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

export function SupportWidget() {
  const { userId } = useSession()
  const { isOpen, setIsOpen, toggleChat } = useChatStore()
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const { data, isLoading } = useSupportConversations(isOpen)

  const conversations = data?.success && data.data ? data.data : []
  const selectedConversation = conversations.find((c) => c.id === selectedId)

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
                {isLoading && (
                  <div className="flex h-full items-center justify-center gap-2 text-sm text-slate-500">
                    <Spinner />
                    กำลังโหลด...
                  </div>
                )}

                {!isLoading && conversations.length === 0 && (
                  <div className="flex h-full items-center justify-center gap-2 text-sm text-slate-500">
                    <IconAlertCircle />
                    ยังไม่มีแชทเข้ามา
                  </div>
                )}

                {conversations.map((conv) => (
                  <button
                    key={conv.id}
                    onClick={() => setSelectedId(conv.id)}
                    className="flex w-full flex-col gap-1 border-b p-4 text-left transition-colors hover:bg-slate-50"
                  >
                    <div className="flex items-center">
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
                      <div className="ml-4 max-w-72 space-y-1">
                        <p className="text-sm leading-none font-medium">
                          {conv.merchantName}
                        </p>
                        <p className="text-muted-foreground line-clamp-3 text-sm">
                          {conv.lastMessage ?? 'ยังไม่มีข้อความ'}
                        </p>
                        <p className="text-muted-foreground text-[10px]">
                          {formatRelativeTime(new Date(conv.lastMessageAt))}
                        </p>
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
        size="icon"
        className="size-14 rounded-full shadow-lg"
        onClick={() => toggleChat()}
      >
        {isOpen ? <X /> : <Headset />}
      </Button>
    </div>
  )
}
