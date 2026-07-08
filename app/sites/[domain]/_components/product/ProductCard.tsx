/* eslint-disable @next/next/no-img-element */
import Link from 'next/link'

import { SectionProductItem } from '@/actions/storefront/sections'
import { formatCurrency } from '@/utils/pricing'
import { calculateProduct } from '@/utils/product'
import { type VariantProps, cva } from 'class-variance-authority'

import { Badge } from '@/components/ui/badge'

import { cn } from '@/lib/utils'

const productCardVariants = cva(
  'h-full rounded-xl transition-all border pb-5 dark:bg-foreground/5 text-foreground group hover:border hover:border-(--brand-color)/50',
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
}

export function ProductCard({ variant, className, product }: ProductCardProps) {
  const { hasDiscount, net, original, maxDiscountPercent } =
    calculateProduct(product)

  const primaryImage = product.images?.[0]
  const isVideo = primaryImage?.url.match(/\.(mp4|webm|ogg)$/i)

  return (
    <Link href={`/products/${product.slug}`}>
      <div className={cn(productCardVariants({ variant }), className)}>
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
            <div className="bg-foreground/20 text-muted-foreground mb-2.5 flex h-32 w-full items-center justify-center rounded-t-xl">
              ไม่มีรูปภาพ
            </div>
          )}

          {hasDiscount && (
            <Badge className="absolute top-0 right-0 size-12 rounded-full bg-(--brand-color) text-center">
              ลด <br /> -{maxDiscountPercent}%
            </Badge>
          )}
        </div>

        <h3 className="line-clamp-2 h-12 px-5 font-medium hover:text-(--brand-color)">
          {product.title}
        </h3>

        <div className="mt-2 flex items-end justify-center gap-2 group-hover:text-(--brand-color)">
          {hasDiscount ? (
            <div className="flex flex-col">
              <data
                value={net?.min}
                className="text-2xl font-bold text-(--brand-color)"
              >
                {formatCurrency(net?.min || 0)}
              </data>
              <span className="text-muted-foreground text-sm line-through">
                {formatCurrency(original?.min || 0)}
              </span>
            </div>
          ) : (
            <data
              value={original?.min}
              className="text-2xl font-bold text-(--brand-color)"
            >
              {formatCurrency(original?.min || 0)}
            </data>
          )}
        </div>
      </div>
    </Link>
  )
}
