export const activityLogKeys = {
  all: ['activity-log'] as const,
  lists: () => [...activityLogKeys.all, 'list'] as const,
  list: (filters: object) => [...activityLogKeys.lists(), filters] as const,
  stats: (storeId: string) => [...activityLogKeys.all, 'stats', storeId] as const,
}
