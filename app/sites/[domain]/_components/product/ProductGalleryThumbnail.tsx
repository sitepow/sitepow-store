import { useProductPurchaseStore } from '../../products/store'

export function ProductGalleryThumbnail() {
  const { product } = useProductPurchaseStore()
  const images = product?.images

  return (
    <div className="flex gap-2">
      {images?.map((image) => (
        <div key={image.imageId} className="size-20 rounded-xl bg-gray-100" />
      ))}
    </div>
  )
}
