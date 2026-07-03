/* eslint-disable jsx-a11y/alt-text */
import { FALLBACK_IMAGE } from '@/constants/system'

/* eslint-disable @next/next/no-img-element */
interface TableImageProps {
  imageUrl?: string
}

export function TableImage({ imageUrl }: TableImageProps) {
  return (
    <div className="flex size-20 shrink-0 items-center">
      <img
        className="size-full rounded-xl object-cover"
        src={imageUrl || FALLBACK_IMAGE}
      />
    </div>
  )
}
