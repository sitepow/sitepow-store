'use client'

import { useRef } from 'react'
import { useForm } from 'react-hook-form'

import { useSendMessage, useToggleConversationAi } from '@/actions/hooks/chat'
import { useChatMessages } from '@/hooks/use-chat-messages'
import { useChatScroll } from '@/hooks/use-chat-scroll'
import { useChatStream } from '@/hooks/use-chat-stream'

import { ChatAIToggle } from './ChatAIToggle'
import { ChatInput } from './ChatInput'
import { MessageBubble } from './MessageBubble'

type ChatFormValues = {
  content: string
}

interface ChatWindowProps {
  conversationId: string
  currentUserId: string
  isAiEnabled?: boolean
  canToggleAi?: boolean
}

export function ChatWindow({
  conversationId,
  currentUserId,
  isAiEnabled,
  canToggleAi = false,
}: ChatWindowProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const { messages } = useChatMessages(conversationId)
  const { register, handleSubmit, reset, watch } = useForm<ChatFormValues>()

  useChatScroll(messages, containerRef)
  useChatStream(conversationId)

  const { mutate: sendMessage } = useSendMessage(conversationId)
  const { mutate: toggleAi } = useToggleConversationAi()

  const hasContent = !!watch('content')?.trim()

  return (
    <div className="flex h-full flex-col">
      {canToggleAi && (
        <ChatAIToggle
          enabled={isAiEnabled}
          onToggle={(c) => {
            toggleAi({
              conversationId: conversationId,
              enabled: c,
            })
          }}
        />
      )}
      <div
        ref={containerRef}
        className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto p-4"
      >
        <div className="flex flex-col gap-4">
          {messages.map((msg) => {
            const isMySender = msg.senderId === currentUserId
            return (
              <MessageBubble key={msg.id} msg={msg} isMySender={isMySender} />
            )
          })}
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
