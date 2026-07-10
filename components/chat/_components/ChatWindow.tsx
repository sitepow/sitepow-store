'use client'

import { useRef } from 'react'
import { useForm } from 'react-hook-form'

import { useSendMessage, useToggleUserAi } from '@/actions/hooks/chat'
import { ConversationType, UserRole } from '@/generated/prisma/enums'
import { useChatMessages } from '@/hooks/use-chat-messages'
import { useChatScroll } from '@/hooks/use-chat-scroll'
import { useChatStream } from '@/hooks/use-chat-stream'
import { useSession } from '@/hooks/use-session'

import { ChatAIToggle } from './ChatAIToggle'
import { ChatInput } from './ChatInput'
import { MessageBubble } from './MessageBubble'

type ChatFormValues = {
  content: string
}

interface ChatWindowProps {
  conversationId: string
  currentUserId: string
  otherUserId?: string
  isAiEnabled?: boolean
  conversationType?: ConversationType
}

export function ChatWindow({
  conversationId,
  currentUserId,
  otherUserId,
  isAiEnabled,
  conversationType,
}: ChatWindowProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const { messages } = useChatMessages(conversationId)
  const { register, handleSubmit, reset, watch } = useForm<ChatFormValues>()

  const { user } = useSession()
  useChatScroll(messages, containerRef)
  useChatStream(conversationId)

  const { mutate: sendMessage } = useSendMessage(conversationId)
  const { mutate: toggleAi } = useToggleUserAi()

  const userRole = user?.role
  const isCanToggleAiFeature =
    userRole === UserRole.SUPPORT ||
    (userRole === UserRole.MERCHANT &&
      conversationType === ConversationType.STORE)

  const hasContent = !!watch('content')?.trim()

  return (
    <div className="flex h-full flex-col">
      {isCanToggleAiFeature && (
        <ChatAIToggle
          enabled={isAiEnabled}
          onToggle={(c) =>
            otherUserId && toggleAi({ userId: otherUserId, enabled: c })
          }
        />
      )}
      <div
        ref={containerRef}
        className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto p-4"
      >
        <div className="flex flex-col gap-4">
          {messages.map((msg) => (
            <MessageBubble
              key={msg.id}
              msg={msg}
              isMySender={msg.senderId === currentUserId}
            />
          ))}
        </div>
      </div>
      <ChatInput
        register={register}
        onSubmit={handleSubmit((data) => {
          sendMessage(data.content)
          reset()
        })}
        disabled={!hasContent}
      />
    </div>
  )
}
