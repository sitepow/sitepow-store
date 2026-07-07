'use client'

import { useEffect } from 'react'

import { useStorefrontProductDetail } from '@/actions/hooks/storefront/product'

import { useProductPurchaseStore } from '../../store'
import { ProductAddToCart } from './ProductAddToCart'
import { ProductAddonSelector } from './ProductAddonSelector'
import { ProductOptionGroups } from './ProductOptionGroups'
import { ProductPriceHeader } from './ProductPriceHeader'
import { ProductVariantSelector } from './ProductVariantSelector'

interface Props {
  storeSlug: string
  productSlug: string
}

export function ProductPurchasePanel({ storeSlug, productSlug }: Props) {
  const { data: product, isLoading } = useStorefrontProductDetail(
    storeSlug,
    productSlug,
  )
  const { setProduct, setIsLoading } = useProductPurchaseStore()

  useEffect(() => {
    setIsLoading(isLoading)
  }, [isLoading, setIsLoading])

  useEffect(() => {
    if (product) setProduct(product)
  }, [product, setProduct])

  return (
    <>
      <ProductPriceHeader />
      <ProductVariantSelector />
      <ProductOptionGroups />
      <ProductAddonSelector />
      <ProductAddToCart />
    </>
  )
}
