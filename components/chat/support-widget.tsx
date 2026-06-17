'use client'

import { useState } from 'react'

import { useSupportConversations } from '@/actions/hooks/chat'
import { useSession } from '@/hooks/use-session'
import { IconSparkles2 } from '@tabler/icons-react'
import { ArrowLeft, Headset, User2, X } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

import { Avatar, AvatarBadge, AvatarFallback } from '../ui/avatar'
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
  const [isOpen, setIsOpen] = useState(false)
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const { data, isLoading } = useSupportConversations(isOpen)

  const conversations = data?.success && data.data ? data.data : []
  const selectedConversation = conversations.find((c) => c.id === selectedId)

  const handleClose = () => {
    setIsOpen(false)
    setSelectedId(null)
  }

  return (
    <div className="fixed right-4 bottom-4 z-50 flex flex-col items-end gap-2">
      {isOpen && (
        <Card className="animate-in slide-in-from-bottom-10 flex h-125 w-87.5 flex-col overflow-hidden shadow-2xl transition-all">
          <CardHeader className="flex flex-row items-center justify-between border-b p-4">
            <CardTitle className="flex items-center gap-2 text-lg">
              {selectedConversation && (
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
            </CardTitle>
            <Button variant="ghost" size="icon" onClick={handleClose}>
              <X />
            </Button>
          </CardHeader>

          <CardContent className="flex-1 overflow-hidden p-0">
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
                  <div className="flex h-full items-center justify-center text-sm text-slate-500">
                    กำลังโหลด...
                  </div>
                )}

                {!isLoading && conversations.length === 0 && (
                  <div className="flex h-full items-center justify-center text-sm text-slate-500">
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
                      <div className="ml-4 max-w-72 space-y-1 wrap-break-word whitespace-pre-line">
                        <p className="text-sm leading-none font-medium">
                          {conv.merchantName}
                        </p>
                        <p className="text-muted-foreground text-sm">
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
          </CardContent>
        </Card>
      )}

      <Button
        size="icon"
        className="size-14 rounded-full shadow-lg"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X /> : <Headset />}
      </Button>
    </div>
  )
}
