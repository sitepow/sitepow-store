import { TicketStatus } from '@/generated/prisma/enums'

export const contactTicketKeys = {
  all: ['contact-tickets'] as const,
  lists: () => [...contactTicketKeys.all, 'list'] as const,
  list: (filters: {
    storeId: string
    page?: number
    limit?: number
    status?: TicketStatus
  }) => [...contactTicketKeys.lists(), filters] as const,
}
