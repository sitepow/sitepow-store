'use client'

import { ProductGalleryHeader } from './ProductGalleryHeader'
import { ProductGalleryMain } from './ProductGalleryMain'
import { ProductGalleryThumbnail } from './ProductGalleryThumbnail'

export function ProductGallery() {
  return (
    <div className="space-y-5">
      <ProductGalleryHeader />
      <div className="flex flex-col gap-4 md:flex-row">
        <div className="order-2 md:order-1">
          <ProductGalleryThumbnail />
        </div>
        <div className="order-1 flex-1 md:order-2">
          <ProductGalleryMain />
        </div>
      </div>
    </div>
  )
}
