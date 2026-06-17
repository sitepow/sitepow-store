'use client'

import { useState } from 'react'

import { useConversation } from '@/actions/hooks/chat'
import { ConversationType } from '@/generated/prisma/enums'
import { useSession } from '@/hooks/use-session'
import { MessageCircle, X } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

import { ChatWindow } from './chat-window'

export function ChatWidget() {
  const { userId } = useSession()
  const [isOpen, setIsOpen] = useState(false)

  const { data } = useConversation(userId!, ConversationType.SUPPORT, isOpen)

  return (
    <div className="fixed right-4 bottom-4 z-50 flex flex-col items-end gap-2">
      {isOpen && data?.success && data.data && (
        <Card className="animate-in slide-in-from-bottom-10 flex h-125 w-87.5 flex-col shadow-2xl transition-all">
          <CardHeader className="flex flex-row items-center justify-between border-b p-4">
            <CardTitle className="text-lg">แชท Support</CardTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                setIsOpen(false)
              }}
            >
              <X />
            </Button>
          </CardHeader>
          <CardContent className="flex-1 overflow-hidden p-0">
            <ChatWindow currentUserId={userId!} conversationId={data.data.id} />
          </CardContent>
        </Card>
      )}

      <Button
        size="icon"
        className="size-14 rounded-full shadow-lg"
        onClick={() => {
          setIsOpen(!isOpen)
        }}
      >
        {isOpen ? <X /> : <MessageCircle />}
      </Button>
    </div>
  )
}
