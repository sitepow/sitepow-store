import { queryOptions, useQuery } from '@tanstack/react-query'

import { shippingKeys } from '../query-keys/shipping'
import { getStoreShippingSettings } from '../shipping'

export function useStoreShippingSettings(storeId: string) {
  return useQuery(
    queryOptions({
      queryKey: shippingKeys.settings(storeId),
      queryFn: async () => await getStoreShippingSettings(storeId),
      enabled: !!storeId,
    }),
  )
}
