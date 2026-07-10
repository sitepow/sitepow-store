import { useMemo } from 'react'

import { useMessages } from '@/actions/hooks/chat'

export function useChatMessages(conversationId: string) {
  const { data, ...rest } = useMessages(conversationId)

  const messages = useMemo(() => {
    if (!data) {
      return []
    }

    const allMessages = [...data.pages].reverse().flatMap((p) => p.items)
    const seen = new Set<string>()
    return allMessages.filter((msg) => {
      if (seen.has(msg.id)) return false
      seen.add(msg.id)
      return true
    })
  }, [data])

  return { messages, ...rest }
}
