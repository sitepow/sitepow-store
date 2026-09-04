export const webhookKeys = {
  all: ['webhook'] as const,
  list: (storeId: string) => [...webhookKeys.all, 'list', storeId] as const,
  detail: (id: string) => [...webhookKeys.all, 'detail', id] as const,
  logs: (endpointId: string) =>
    [...webhookKeys.all, 'logs', endpointId] as const,
}
