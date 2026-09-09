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
  showAIToggleBar?: boolean
  headerContent?: React.ReactNode
}

function formatDateSeparator(dateStr: Date | string) {
  const date = new Date(dateStr)
  const today = new Date()
  const yesterday = new Date()
  yesterday.setDate(today.getDate() - 1)

  if (date.toDateString() === today.toDateString()) {
    return 'วันนี้'
  }
  if (date.toDateString() === yesterday.toDateString()) {
    return 'เมื่อวาน'
  }
  return date.toLocaleDateString('th-TH', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

export function ChatWindow({
  conversationId,
  currentUserId,
  isAiEnabled,
  canToggleAi = false,
  showAIToggleBar = true,
  headerContent,
}: ChatWindowProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const { messages } = useChatMessages(conversationId)
  const { register, handleSubmit, reset, watch, setValue } =
    useForm<ChatFormValues>()

  useChatScroll(messages, containerRef)
  useChatStream(conversationId)

  const { mutate: sendMessage } = useSendMessage(conversationId)
  const { mutate: toggleAi } = useToggleConversationAi()

  const hasContent = !!watch('content')?.trim()

  return (
    <div className="bg-background flex h-full flex-col">
      {headerContent}
      {canToggleAi && showAIToggleBar && (
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
        className="bg-muted/20 min-h-0 flex-1 overflow-x-hidden overflow-y-auto p-4"
      >
        {messages.length === 0 && (
          <div className="flex h-full flex-col items-center justify-center text-center">
            <p className="text-muted-foreground text-xs">
              เริ่มต้นบทสนทนาโดยการพิมพ์ข้อความด้านล่าง
            </p>
          </div>
        )}
        <div className="flex flex-col gap-3">
          {messages.map((msg, index) => {
            const prevMsg = messages[index - 1]
            const isNewDay =
              !prevMsg ||
              new Date(prevMsg.createdAt).toDateString() !==
                new Date(msg.createdAt).toDateString()
            const isMySender = msg.senderId === currentUserId

            return (
              <div key={msg.id} className="flex flex-col gap-3">
                {isNewDay && (
                  <div className="my-2 flex items-center justify-center">
                    <span className="bg-background border-border/60 text-muted-foreground rounded-full border px-3 py-1 text-[11px] font-medium shadow-2xs select-none">
                      {formatDateSeparator(msg.createdAt)}
                    </span>
                  </div>
                )}
                <MessageBubble msg={msg} isMySender={isMySender} />
              </div>
            )
          })}
        </div>
      </div>
      <ChatInput
        register={register}
        setValue={setValue}
        onSubmit={handleSubmit((data) => {
          sendMessage(data.content)
          reset()
        })}
        disabled={!hasContent}
      />
    </div>
  )
}
