export const webhookKeys = {
  all: ['webhook'] as const,
  endpoints: (storeId: string) =>
    [...webhookKeys.all, 'endpoints', storeId] as const,
  endpoint: (id: string) => [...webhookKeys.all, 'endpoint', id] as const,
  deliveries: (storeId: string, endpointId?: string) =>
    [...webhookKeys.all, 'deliveries', storeId, endpointId] as const,
}
