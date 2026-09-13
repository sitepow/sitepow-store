import { RefObject, useLayoutEffect, useRef } from 'react'

import type { Message } from '@/generated/prisma/browser'

export function useChatScroll(
  messages: Message[],
  containerRef: RefObject<HTMLDivElement | null>,
) {
  const prevScrollHeightRef = useRef<number | null>(null)
  const prevMessageCountRef = useRef(0)
  const prevLastMessageIdRef = useRef<string | null>(null)

  useLayoutEffect(() => {
    const container = containerRef.current
    if (!container) {
      return
    }

    const newCount = messages.length
    const lastMessage = messages[messages.length - 1]
    const isNewLastMessage =
      lastMessage && lastMessage.id !== prevLastMessageIdRef.current

    if (prevScrollHeightRef.current !== null) {
      const delta = container.scrollHeight - prevScrollHeightRef.current
      container.scrollTop += delta
      prevScrollHeightRef.current = null
    } else if (newCount > prevMessageCountRef.current && isNewLastMessage) {
      container.scrollTop = container.scrollHeight
    }

    prevMessageCountRef.current = newCount
    prevLastMessageIdRef.current = lastMessage?.id ?? null
  }, [containerRef, messages])

  return { prevScrollHeightRef }
}
