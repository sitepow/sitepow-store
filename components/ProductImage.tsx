import Image from 'next/image'

import { isVideoUrl } from '@/utils/media'

import { EmptyImage } from '@/components/EmptyImage'

import { cn } from '@/lib/utils'

interface ProductImageProps {
  src?: string | null
  alt?: string
  className?: string
}

export function ProductImage({
  src,
  alt = 'Image',
  className,
}: ProductImageProps) {
  const isVideo = isVideoUrl(src)

  return (
    <div
      className={cn(
        'relative aspect-square size-16 flex-none shrink-0 cursor-pointer overflow-hidden md:size-20',
        className,
      )}
    >
      {src ? (
        isVideo ? (
          <video
            src={src}
            autoPlay
            muted
            loop
            playsInline
            className="absolute inset-0 size-full object-cover object-center"
          />
        ) : (
          <Image
            src={src}
            alt={alt}
            fill
            sizes="(max-width: 768px) 64px, 80px"
            className="object-cover object-center"
          />
        )
      ) : (
        <EmptyImage className="text-[10px]" text={alt} />
      )}
    </div>
  )
}
