import Image from 'next/image'

import { FALLBACK_MERCHANT_BANNER_IMAGE } from '@/constants/system'

interface StoreHeaderBackgroundProps {
  coverImage?: string | File | null
}

export function StoreHeaderBackground({
  coverImage,
}: StoreHeaderBackgroundProps) {
  const isVideo =
    typeof coverImage === 'string' && /\.(mp4|webm|ogg)$/i.test(coverImage)

  return (
    <div className="absolute inset-0 -z-10 overflow-hidden">
      {isVideo ? (
        <video
          src={
            typeof coverImage === 'string'
              ? coverImage
              : URL.createObjectURL(coverImage as File)
          }
          autoPlay
          loop
          muted
          playsInline
          className="size-full object-cover opacity-40"
        />
      ) : (
        <Image
          src={
            (typeof coverImage === 'string' ? coverImage : null) ||
            FALLBACK_MERCHANT_BANNER_IMAGE
          }
          alt="footer-background"
          fill
          className="object-cover opacity-40"
        />
      )}
    </div>
  )
}
