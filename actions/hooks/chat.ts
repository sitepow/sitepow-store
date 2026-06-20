'use client'

import {
  getConversation,
  getMessages,
  getSupportConversations,
  getUnreadCount,
  markAsRead,
  sendMessage,
  toggleUserAi,
} from '@/actions/chat'
import {
  CHAT_REFETCH_INTERVAL,
  UNREAD_COUNT_REFETCH_INTERVAL,
} from '@/constants/system'
import { ConversationType, Message } from '@/generated/prisma/client'
import {
  InfiniteData,
  infiniteQueryOptions,
  queryOptions,
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'

import { chatKeys } from '../query-keys/chat'

export type ChatData = {
  items: Message[]
  nextCursor?: string
}

export function useConversation(
  userId: string,
  type: ConversationType,
  enabled: boolean,
  storeId?: string,
) {
  return useQuery(
    queryOptions({
      queryKey: chatKeys.conversation(userId, type, storeId),
      queryFn: () => getConversation(type, storeId),
      enabled: enabled,
    }),
  )
}

export function useSupportConversations(enabled = true, storeId?: string) {
  return useQuery(
    queryOptions({
      queryKey: chatKeys.supportConversations(storeId),
      queryFn: () => getSupportConversations(storeId),
      enabled,
      refetchInterval: CHAT_REFETCH_INTERVAL,
    }),
  )
}

const messageOptions = (conversationId: string) =>
  infiniteQueryOptions({
    queryKey: chatKeys.messages(conversationId),
    queryFn: ({ pageParam }) =>
      getMessages(conversationId, pageParam as string),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
  })

export function useMessages(conversationId: string) {
  return useInfiniteQuery(messageOptions(conversationId))
}

export function useSendMessage(conversationId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (content: string) => {
      return sendMessage(conversationId, content)
    },
    onSuccess: (result) => {
      if (!result.success || !result.data) {
        return
      } else {
        const newMessage = result.data

        queryClient.setQueryData(
          chatKeys.messages(conversationId),
          (old: InfiniteData<ChatData> | undefined) => {
            if (!old) {
              return old
            }

            return {
              ...old,
              pages: old.pages.map((p, i) => {
                if (i === 0) {
                  return { ...p, items: [...p.items, newMessage] }
                }
                return p
              }),
            }
          },
        )

        queryClient.invalidateQueries({
          queryKey: chatKeys.supportConversations(),
        })
      }
    },
  })
}

export function useToggleUserAi() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ userId, enabled }: { userId: string; enabled: boolean }) => {
      return toggleUserAi(userId, enabled)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: chatKeys.supportConversations(),
      })
    },
  })
}

export function useUnreadCount(userId: string) {
  return useQuery(
    queryOptions({
      queryKey: chatKeys.unreadCount(userId!),
      queryFn: () => getUnreadCount(),
      enabled: !!userId,
      refetchInterval: UNREAD_COUNT_REFETCH_INTERVAL,
    }),
  )
}

export function useMarkAsRead(userId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (conversationId: string) => markAsRead(conversationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: chatKeys.unreadCount(userId) })
      queryClient.invalidateQueries({
        queryKey: chatKeys.supportConversations(),
      })
    },
  })
}
