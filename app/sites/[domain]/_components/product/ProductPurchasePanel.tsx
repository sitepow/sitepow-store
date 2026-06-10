'use client'

import { useEffect } from 'react'

import { useStorefrontProductDetail } from '@/actions/hooks/storefront/product'

import { useProductPurchaseStore } from '../../products/store'
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
  const { data: product } = useStorefrontProductDetail(storeSlug, productSlug)
  const { setProduct } = useProductPurchaseStore()

  useEffect(() => {
    if (product) setProduct(product)
  }, [product, setProduct])

  if (!product) {
    return null
  }

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
