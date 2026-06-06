import { StaffRole } from '@/generated/prisma/enums'

export const staffKeys = {
  all: ['staffs'] as const,
  lists: () => [...staffKeys.all, 'list'] as const,
  list: (filters: {
    storeId: string
    page?: number
    limit?: number
    search?: string
    role?: StaffRole
  }) => [...staffKeys.lists(), filters] as const,
  detail: (id: string) => [...staffKeys.all, 'detail', id] as const,
}
