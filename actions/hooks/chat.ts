'use client'

import {
  createOrGetConversation,
  fetchMessages,
  fetchSupportConversations,
  sendMessage,
  toggleUserAi,
} from '@/actions/chat'
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
) {
  return useQuery(
    queryOptions({
      queryKey: chatKeys.conversation(userId, type),
      queryFn: () => {
        return createOrGetConversation([userId], type)
      },
      enabled: enabled,
      staleTime: Infinity,
    }),
  )
}

export function useSupportConversations(enabled = true) {
  return useQuery(
    queryOptions({
      queryKey: chatKeys.supportConversations(),
      queryFn: () => fetchSupportConversations(),
      enabled,
      refetchInterval: 15000,
    }),
  )
}

const messageOptions = (conversationId: string) =>
  infiniteQueryOptions({
    queryKey: chatKeys.messages(conversationId),
    queryFn: ({ pageParam }) =>
      fetchMessages(conversationId, pageParam as string),
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
            } else {
              return {
                ...old,
                pages: old.pages.map((p, i) => {
                  if (i === old.pages.length - 1) {
                    return { ...p, items: [...p.items, newMessage] }
                  } else {
                    return p
                  }
                }),
              }
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
