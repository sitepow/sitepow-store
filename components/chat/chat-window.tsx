'use client'

import { useEffect, useLayoutEffect, useMemo, useRef } from 'react'
import { useForm } from 'react-hook-form'

import {
  useMessages,
  useSendMessage,
  useToggleUserAi,
} from '@/actions/hooks/chat'
import { ConversationType, UserRole } from '@/generated/prisma/enums'
import { useChatStream } from '@/hooks/use-chat-stream'
import { useSession } from '@/hooks/use-session'
import { IconSend2 } from '@tabler/icons-react'

import { Button } from '@/components/ui/button'

import { cn } from '@/lib/utils'

import { MarkdownRenderer } from '../MarkdownRenderer'
import { Label } from '../ui/label'
import { Switch } from '../ui/switch'
import { Textarea } from '../ui/textarea'

type ChatFormValues = {
  content: string
}

export function ChatWindow({
  conversationId,
  currentUserId,
  otherUserId,
  isAiEnabled,
  conversationType,
}: {
  conversationId: string
  currentUserId: string
  otherUserId?: string
  isAiEnabled?: boolean
  conversationType?: ConversationType
}) {
  const containerRef = useRef<HTMLDivElement>(null)
  const topRef = useRef<HTMLDivElement>(null)

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useMessages(conversationId)
  const { mutate: sendMessage } = useSendMessage(conversationId)
  const { user } = useSession()

  const userRole = user?.role
  const isCanToggleAiFeature =
    userRole === UserRole.SUPPORT ||
    (userRole === UserRole.MERCHANT &&
      conversationType === ConversationType.STORE)

  const { mutate: toggleAi } = useToggleUserAi()

  const prevScrollHeightRef = useRef<number | null>(null)
  const prevMessageCountRef = useRef(0)
  const prevLastMessageIdRef = useRef<string | null>(null)

  useEffect(() => {
    const container = containerRef.current
    const target = topRef.current
    if (!container || !target) {
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          prevScrollHeightRef.current = container.scrollHeight
          fetchNextPage()
        }
      },
      { root: container, threshold: 1 },
    )

    observer.observe(target)
    return () => observer.disconnect()
  }, [hasNextPage, isFetchingNextPage, fetchNextPage])

  const { register, handleSubmit, reset, watch } = useForm<ChatFormValues>({
    defaultValues: { content: '' },
  })

  useChatStream(conversationId)

  const messages = useMemo(() => {
    if (!data) {
      return []
    }

    const allMessages = [...data.pages].reverse().flatMap((p) => p.items)

    const seen = new Set<string>()
    const deduped = []

    for (const msg of allMessages) {
      if (!seen.has(msg.id)) {
        seen.add(msg.id)
        deduped.push(msg)
      }
    }

    return deduped
  }, [data])

  useLayoutEffect(() => {
    const container = containerRef.current
    if (!container) {
      return
    }

    const prevCount = prevMessageCountRef.current
    const newCount = messages.length
    const lastMessage = messages[messages.length - 1]
    const isNewLastMessage =
      !!lastMessage && lastMessage.id !== prevLastMessageIdRef.current

    if (prevScrollHeightRef.current !== null) {
      const newScrollHeight = container.scrollHeight
      const delta = newScrollHeight - prevScrollHeightRef.current
      container.scrollTop += delta
      prevScrollHeightRef.current = null
    } else if (newCount > prevCount && isNewLastMessage) {
      container.scrollTop = container.scrollHeight
    }

    prevMessageCountRef.current = newCount
    prevLastMessageIdRef.current = lastMessage?.id ?? null
  }, [messages])

  const onSubmit = ({ content }: ChatFormValues) => {
    if (content.trim() === '') {
      return
    }
    sendMessage(content)
    reset()
  }

  const hasContent = !!watch('content')?.trim()

  return (
    <div className="flex h-full flex-col">
      {isCanToggleAiFeature && (
        <div className="bg-foreground/5 flex items-center justify-between border-b p-3">
          <span className="text-foreground text-xs font-semibold">
            ตั้งค่า AI สำหรับลูกค้ารายนี้
          </span>
          <div className="flex items-center space-x-2">
            <Label htmlFor="ai-mode" className="text-xs">
              เปิดใช้งาน AI
            </Label>
            <Switch
              id="ai-mode"
              checked={isAiEnabled}
              onCheckedChange={(checked) =>
                otherUserId &&
                toggleAi({ userId: otherUserId, enabled: checked })
              }
            />
          </div>
        </div>
      )}

      <div ref={containerRef} className="min-h-0 flex-1 overflow-y-auto p-4">
        <div className="flex flex-col gap-4">
          <div ref={topRef} className="h-2" />

          {messages.map((msg) => {
            const isBot = msg?.sender?.role === UserRole.BOT
            const isMySender = msg.senderId === currentUserId

            const isMe = isBot ? false : isMySender

            const isLeft = !isMe
            return (
              <div
                key={msg.id}
                className={cn(
                  'flex w-full flex-col',
                  !isLeft ? 'items-end' : 'items-start',
                )}
              >
                {isBot && <span className="mb-1">AI Support</span>}
                <div
                  className={cn(
                    'max-w-[80%] rounded-2xl px-4 py-2 text-sm shadow-sm',
                    !isLeft
                      ? 'rounded-tr-none bg-blue-600 text-white'
                      : isBot
                        ? 'bg-primary dark:bg-primary/50 rounded-tl-none border text-white'
                        : 'dark:bg-foreground/5 dark:text-foreground border-border rounded-tl-none border bg-white text-slate-800',
                  )}
                >
                  <MarkdownRenderer
                    className="text-inherit md:w-fit dark:text-inherit"
                    content={msg.content}
                  />
                  <span
                    className={cn(
                      'mt-1 block text-[10px] opacity-70',
                      !isLeft
                        ? 'text-blue-100'
                        : isBot
                          ? 'text-white'
                          : 'text-slate-500',
                    )}
                  >
                    {new Date(msg.createdAt).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex gap-2 overflow-y-scroll border-t p-4"
      >
        <Textarea
          {...register('content')}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault()
              handleSubmit(onSubmit)()
            }
          }}
          placeholder="พิมพ์ข้อความ..."
        />
        <Button type="submit" disabled={!hasContent} className="shrink-0">
          <IconSend2 />
          ส่ง
        </Button>
      </form>
    </div>
  )
}
