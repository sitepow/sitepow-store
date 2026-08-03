/* eslint-disable @next/next/no-img-element */
import Link from 'next/link'

import { SectionProductItem } from '@/actions/storefront/sections'
import { isVideoUrl } from '@/utils/media'
import { formatCurrency } from '@/utils/pricing'
import { calculateProduct } from '@/utils/product'
import { IconAlertCircle } from '@tabler/icons-react'
import { type VariantProps, cva } from 'class-variance-authority'

import { Badge } from '@/components/ui/badge'

import { cn } from '@/lib/utils'

import { EmptyImage } from '../EmptyImage'

const productCardVariants = cva(
  'h-full rounded-xl transition-all border pb-2.5 dark:bg-foreground/5 text-foreground group hover:border hover:border-primary/50',
  {
    variants: {
      variant: {
        outline: 'border border-border',
        shadow: 'shadow-airy ',
      },
    },
  },
)

interface ProductCardProps extends VariantProps<typeof productCardVariants> {
  product: SectionProductItem
  className?: string
  onClick?: () => void
  href?: string
  quantity?: number
}

export function ProductCard({
  variant,
  className,
  product,
  onClick,
  href,
  quantity,
}: ProductCardProps) {
  const { hasDiscount, net, original, maxDiscountPercent } =
    calculateProduct(product)

  const primaryImage = product.images?.[0]
  const isVideo = isVideoUrl(primaryImage?.url)
  const isOutOfStock = quantity !== undefined && quantity <= 0

  const content = (
    <div
      className={cn(
        productCardVariants({ variant }),
        onClick && 'cursor-pointer',
        isOutOfStock && 'opacity-50',
        className,
      )}
      onClick={onClick}
    >
      <div className="relative overflow-hidden rounded-t-xl">
        {primaryImage ? (
          <div className="relative mb-2.5 aspect-square w-full overflow-hidden bg-transparent">
            {isVideo ? (
              <video
                src={primaryImage.url}
                className="size-full object-cover"
                muted
                playsInline
                loop
              />
            ) : (
              <img
                src={primaryImage.url}
                alt={product.title}
                className="size-full object-cover"
              />
            )}
          </div>
        ) : (
          <EmptyImage className="h-32" />
        )}
        {isOutOfStock ? (
          <Badge
            variant="destructive"
            className="absolute top-2 right-2 text-xs"
          >
            <IconAlertCircle /> สินค้าหมด
          </Badge>
        ) : (
          hasDiscount && (
            <Badge className="bg-primary absolute top-0 right-0 size-12 rounded-full text-center">
              ลด <br /> -{maxDiscountPercent}%
            </Badge>
          )
        )}
      </div>
      <h3 className="group-hover:text-primary line-clamp-2 h-12 px-1 font-medium">
        {product.title}
      </h3>
      <div className="group-hover:text-primary mt-1 flex items-end justify-center gap-2">
        {hasDiscount ? (
          <div className="flex flex-col">
            <data value={net?.min} className="text-primary text-2xl font-bold">
              {formatCurrency(net?.min || 0)}
            </data>
            <span className="text-muted-foreground text-sm line-through">
              {formatCurrency(original?.min || 0)}
            </span>
          </div>
        ) : (
          <data
            value={original?.min}
            className="text-primary text-2xl font-bold"
          >
            {formatCurrency(original?.min || 0)}
          </data>
        )}
      </div>
    </div>
  )

  if (onClick) {
    return content
  }

  return <Link href={href || `/products/${product.slug}`}>{content}</Link>
}
