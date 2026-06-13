'use server'

import { Prisma } from '@/generated/prisma/client'
import { ActorType, LogAction, TicketStatus } from '@/generated/prisma/enums'

import { createLog } from '@/lib/activity-log'
import { prisma } from '@/lib/prisma'

interface GetContactTicketsParams {
  storeId: string
  page?: number
  limit?: number
  status?: TicketStatus
}

const contactTicketSelect = {
  id: true,
  subject: true,
  message: true,
  status: true,
  orderId: true,
  createdAt: true,
  customer: {
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
    },
  },
} satisfies Prisma.ContactTicketSelect

export type GetContactTicketsItem = Prisma.ContactTicketGetPayload<{
  select: typeof contactTicketSelect
}>

export interface GetContactTicketsResponse {
  data: GetContactTicketsItem[]
  meta: {
    currentPage: number
    limit: number
    totalItems: number
    totalPages: number
    hasNextPage: boolean
    hasPreviousPage: boolean
  }
}

export async function getContactTickets({
  storeId,
  page = 1,
  limit = 10,
  status,
}: GetContactTicketsParams): Promise<GetContactTicketsResponse> {
  try {
    const sanitizedPage = Math.max(1, page)
    const sanitizedLimit = Math.max(1, Math.min(20, limit))
    const skip = (sanitizedPage - 1) * sanitizedLimit

    const whereClause: Prisma.ContactTicketWhereInput = { storeId }

    if (status) {
      whereClause.status = status
    }

    const [totalItems, tickets] = await Promise.all([
      prisma.contactTicket.count({ where: whereClause }),
      prisma.contactTicket.findMany({
        where: whereClause,
        skip,
        take: sanitizedLimit,
        orderBy: { createdAt: 'desc' },
        select: contactTicketSelect,
      }),
    ])

    const totalPages = Math.ceil(totalItems / sanitizedLimit)

    return {
      data: tickets,
      meta: {
        currentPage: sanitizedPage,
        limit: sanitizedLimit,
        totalItems,
        totalPages,
        hasNextPage: sanitizedPage < totalPages,
        hasPreviousPage: sanitizedPage > 1,
      },
    }
  } catch {
    return {
      data: [],
      meta: {
        currentPage: page,
        limit,
        totalItems: 0,
        totalPages: 0,
        hasNextPage: false,
        hasPreviousPage: false,
      },
    }
  }
}

export async function updateTicketStatus(id: string, status: TicketStatus) {
  if (!id) {
    throw new Error('ไม่พบ Ticket ID')
  }

  const ticket = await prisma.contactTicket.findUnique({
    where: { id },
    select: { storeId: true, status: true },
  })

  await prisma.contactTicket.update({
    where: { id },
    data: { status },
  })

  await createLog({
    action: LogAction.UPDATE_ORDER_STATUS,
    actorType: ActorType.MERCHANT,
    storeId: ticket?.storeId,
    entity: 'ContactTicket',
    entityId: id,
    details: { from: ticket?.status, to: status },
  })

  return { message: 'อัปเดตสถานะ Ticket สำเร็จ' }
}
