/* eslint-disable @next/next/no-img-element */
import { useStorefrontProductDetail } from '@/actions/storefront/product/hooks'
import { isVideoUrl } from '@/utils/media/video'

import { Skeleton } from '@/components/ui/skeleton'

import { EmptyImage } from '../../../_components/shared/EmptyImage'
import { useProductPurchaseStore } from '../../store'

interface Props {
  storeSlug?: string
  productSlug?: string
}

export function ProductGalleryMain({ storeSlug, productSlug }: Props) {
  const { data: queryProduct } = useStorefrontProductDetail(
    storeSlug ?? '',
    productSlug ?? '',
  )
  const {
    product: storeProduct,
    isLoading: isStoreLoading,
    activeImageIndex,
  } = useProductPurchaseStore()

  const product = storeProduct || queryProduct
  const isLoading = !product && isStoreLoading

  const activeImage = product?.images?.[activeImageIndex]

  if (isLoading) {
    return <Skeleton className="aspect-square w-full md:aspect-4/3" />
  }

  if (!activeImage) {
    return <EmptyImage className="aspect-square w-full md:aspect-4/3" />
  }

  const productTitle = product?.title || 'สินค้า'

  return (
    <figure
      aria-label={`ภาพสินค้าหลัก: ${productTitle}`}
      className="relative flex aspect-square h-52 w-full items-center justify-center overflow-hidden rounded-2xl bg-gray-50 dark:bg-neutral-900 md:aspect-4/3 md:h-full"
    >
      {isVideoUrl(activeImage.url) ? (
        <video
          key={activeImage.url}
          src={activeImage.url}
          className="size-full object-contain"
          controls
          autoPlay
          muted
          aria-label={`วิดีโอแสดงสินค้า: ${productTitle}`}
        />
      ) : (
        <img
          key={activeImage.url}
          src={activeImage.url}
          alt={`${productTitle} - ภาพที่ ${activeImageIndex + 1}`}
          loading="eager"
          decoding="async"
          className="size-full object-contain"
        />
      )}
      <figcaption className="sr-only">
        {productTitle} ภาพมุมมองที่ {activeImageIndex + 1}
      </figcaption>
    </figure>
  )
}
