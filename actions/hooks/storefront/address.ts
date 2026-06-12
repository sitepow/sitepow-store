'use client'

import { addressKeys } from '@/actions/query-keys/storefront/address'
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

export function useAddresses() {
  return useQuery(
    queryOptions({
      queryKey: addressKeys.lists(),
      queryFn: () => getAddresses(),
    }),
  )
}

export function useAddressOptions() {
  return useQuery(
    queryOptions({
      queryKey: addressKeys.options(),
      queryFn: () => getAddressOptions(),
    }),
  )
}

export function useCreateAddress() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: Omit<AddressDetail, 'id' | 'isDefault'>) =>
      createAddress(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: addressKeys.all })
    },
  })
}

export function useUpdateAddress() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string
      data: Partial<Omit<AddressDetail, 'id' | 'isDefault'>>
    }) => updateAddress(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: addressKeys.all })
    },
  })
}

export function useDeleteAddress() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => deleteAddress(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: addressKeys.all })
    },
  })
}

export function useSetDefaultAddress() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => setDefaultAddress(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: addressKeys.all })
    },
  })
}
