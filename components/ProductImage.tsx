import Image from 'next/image'

import { EmptyImage } from '@/app/sites/[domain]/_components/EmptyImage'

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
  return (
    <div
      className={cn(
        'relative aspect-square size-16 flex-none shrink-0 cursor-pointer overflow-hidden md:size-20',
        className,
      )}
    >
      {src ? (
        <Image
          src={src}
          alt={alt}
          fill
          sizes="(max-width: 768px) 64px, 80px"
          className="object-cover object-center"
        />
      ) : (
        <EmptyImage className="text-[10px]" />
      )}
    </div>
  )
}
