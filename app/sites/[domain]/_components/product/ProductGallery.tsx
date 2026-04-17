'use client'

import { ProductGalleryHeader } from './ProductGalleryHeader'
import { ProductGalleryMain } from './ProductGalleryMain'
import { ProductGalleryThumbnail } from './ProductGalleryThumbnail'

export function ProductGallery() {
  return (
    <>
      <ProductGalleryHeader />
      <ProductGalleryMain />
      <ProductGalleryThumbnail />
    </>
  )
}
