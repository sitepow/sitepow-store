'use client'

import { storefrontAddressKeys } from '@/actions/query-keys/storefront/address'
import {
  AddressDetail,
  createAddress,
  deleteAddress,
  getAddressOptions,
  getAddresses,
  setDefaultAddress,
  updateAddress,
} from '@/actions/storefront/address'
import {
  queryOptions,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'

export function useAddresses(storeSlug: string) {
  return useQuery(
    queryOptions({
      queryKey: storefrontAddressKeys.lists(storeSlug),
      queryFn: () => getAddresses(storeSlug),
      enabled: !!storeSlug,
    }),
  )
}

export function useAddressOptions(storeSlug: string) {
  return useQuery(
    queryOptions({
      queryKey: storefrontAddressKeys.options(storeSlug),
      queryFn: () => getAddressOptions(storeSlug),
      enabled: !!storeSlug,
    }),
  )
}

export function useCreateAddress(storeSlug: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: Omit<AddressDetail, 'id' | 'isDefault' | 'storeId'>) =>
      createAddress(data, storeSlug),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: storefrontAddressKeys.lists(storeSlug),
      })
      queryClient.invalidateQueries({
        queryKey: storefrontAddressKeys.options(storeSlug),
      })
    },
  })
}

export function useUpdateAddress(storeSlug?: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string
      data: Partial<Omit<AddressDetail, 'id' | 'isDefault' | 'storeId'>>
    }) => updateAddress(id, data),
    onSuccess: () => {
      if (storeSlug) {
        queryClient.invalidateQueries({
          queryKey: storefrontAddressKeys.lists(storeSlug),
        })
        queryClient.invalidateQueries({
          queryKey: storefrontAddressKeys.options(storeSlug),
        })
      } else {
        queryClient.invalidateQueries({ queryKey: storefrontAddressKeys.all })
      }
    },
  })
}

export function useDeleteAddress(storeSlug?: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => deleteAddress(id),
    onSuccess: () => {
      if (storeSlug) {
        queryClient.invalidateQueries({
          queryKey: storefrontAddressKeys.lists(storeSlug),
        })
        queryClient.invalidateQueries({
          queryKey: storefrontAddressKeys.options(storeSlug),
        })
      } else {
        queryClient.invalidateQueries({ queryKey: storefrontAddressKeys.all })
      }
    },
  })
}

export function useSetDefaultAddress(storeSlug?: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => setDefaultAddress(id),
    onSuccess: () => {
      if (storeSlug) {
        queryClient.invalidateQueries({
          queryKey: storefrontAddressKeys.lists(storeSlug),
        })
        queryClient.invalidateQueries({
          queryKey: storefrontAddressKeys.options(storeSlug),
        })
      } else {
        queryClient.invalidateQueries({ queryKey: storefrontAddressKeys.all })
      }
    },
  })
}
