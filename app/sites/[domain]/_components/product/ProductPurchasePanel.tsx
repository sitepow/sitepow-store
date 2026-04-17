'use client'

import { useEffect } from 'react'

import { Product } from '@/types/sites/product'

import { useProductPurchaseStore } from '../../products/store'
import { ProductAddToCart } from './ProductAddToCart'
import { ProductAddonSelector } from './ProductAddonSelector'
import { ProductOptionGroups } from './ProductOptionGroups'
import { ProductPriceHeader } from './ProductPriceHeader'
import { ProductVariantSelector } from './ProductVariantSelector'

export function ProductPurchasePanel({ product }: { product: Product }) {
  const { setProduct } = useProductPurchaseStore()

  useEffect(() => {
    setProduct(product)
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
