'use client'

import { useState } from 'react'

import {
  usePOSProducts,
  useResellerPOSProducts,
} from '@/actions/hooks/pos/product'
import { POSProductItem } from '@/actions/pos/product'
import { useDebouncedValue } from '@/hooks/use-debounced-value'
import { ALL_STORES } from '@/stores/use-store-filter'

interface UsePosMergedProductsParams {
  selectedStoreId: string
  selectedBranchId: string
  selectedAgreementId?: string
  isPosReseller: boolean
}

export function usePosMergedProducts({
  selectedStoreId,
  selectedBranchId,
  selectedAgreementId,
  isPosReseller,
}: UsePosMergedProductsParams) {
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebouncedValue(search, 400)

  const isAllAgreement =
    !selectedAgreementId || selectedAgreementId === ALL_STORES

  const { data: ownProducts = [], isLoading: isOwnProductsLoading } =
    usePOSProducts({
      storeId: selectedStoreId,
      branchId: selectedBranchId,
      search: debouncedSearch,
    })

  const {
    data: rawResellerProducts = [],
    isLoading: isResellerProductsLoading,
  } = useResellerPOSProducts({
    agreementId: isAllAgreement ? '' : selectedAgreementId,
    branchId: selectedBranchId,
    storeId: selectedStoreId,
    search: debouncedSearch,
  })

  const resellerProducts =
    !isAllAgreement || isPosReseller ? rawResellerProducts : []

  const resellerMap = new Map(
    (resellerProducts as unknown as POSProductItem[]).map((p) => [p.id, p]),
  )

  const filteredOwnProducts = (ownProducts as POSProductItem[]).filter(
    (p) => !resellerMap.has(p.id),
  )

  const products = [
    ...filteredOwnProducts,
    ...(resellerProducts as unknown as POSProductItem[]),
  ]

  const isProductsLoading =
    isOwnProductsLoading ||
    ((!isAllAgreement || isPosReseller) && isResellerProductsLoading)

  const resellerAgreementId = !isAllAgreement
    ? selectedAgreementId
    : isPosReseller && resellerProducts.length > 0
      ? (resellerProducts[0] as unknown as POSProductItem)?.resellerAgreementId
      : undefined

  return {
    search,
    setSearch,
    products,
    isProductsLoading,
    resellerAgreementId,
  }
}
