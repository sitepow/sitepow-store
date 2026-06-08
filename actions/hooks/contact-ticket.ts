import { TicketStatus } from '@/generated/prisma/enums'
import {
  queryOptions,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'

import { getContactTickets, updateTicketStatus } from '../contact-ticket'
import { contactTicketKeys } from '../query-keys/contact-ticket'

interface UseContactTicketsParams {
  storeId: string
  page?: number
  limit?: number
  status?: TicketStatus
}

export function useContactTickets({
  storeId,
  page = 1,
  limit = 10,
  status,
}: UseContactTicketsParams) {
  const filters = { storeId, page, limit, status }

  return useQuery(
    queryOptions({
      queryKey: contactTicketKeys.list(filters),
      queryFn: async () => await getContactTickets(filters),
      enabled: !!storeId,
      placeholderData: (prev) => prev,
    }),
  )
}

export function useUpdateTicketStatus() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: TicketStatus }) =>
      await updateTicketStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: contactTicketKeys.all })
    },
  })
}
