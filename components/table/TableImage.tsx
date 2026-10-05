/* eslint-disable jsx-a11y/alt-text */
import { FALLBACK_IMAGE } from '@/constants/system'

/* eslint-disable @next/next/no-img-element */
interface TableImageProps {
  imageUrl?: string
}

export function TableImage({ imageUrl }: TableImageProps) {
  return (
    <div className="flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-border/60 bg-muted/20">
      <img
        className="size-full object-cover"
        src={imageUrl || FALLBACK_IMAGE}
      />
    </div>
  )
}
