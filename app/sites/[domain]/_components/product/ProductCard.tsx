/* eslint-disable @next/next/no-img-element */
import Link from 'next/link'

import { SectionProductItem } from '@/actions/storefront/sections/actions'
import { isVideoUrl } from '@/utils/media/video'
import { formatCurrency } from '@/utils/formatting/number'
import { calculateProduct } from '@/utils/product/product-calculation'
import { IconAlertCircle, IconBuildingStore } from '@tabler/icons-react'
import { type VariantProps, cva } from 'class-variance-authority'

import { Badge } from '@/components/ui/badge'

import { cn } from '@/lib/utils'

import { EmptyImage } from '../shared/EmptyImage'

const productCardVariants = cva(
  'h-full rounded-xl border border-border bg-card text-card-foreground shadow-xs transition-all pb-2.5 group hover:border-primary/50',
  {
    variants: {
      variant: {
        nothing: '',
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
  isReseller?: boolean
}

export function ProductCard({
  variant,
  className,
  product,
  onClick,
  href,
  quantity,
  isReseller,
}: ProductCardProps) {
  const { hasDiscount, net, original, maxDiscountPercent } =
    calculateProduct(product)

  const primaryImage = product.images?.[0]
  const isVideo = isVideoUrl(primaryImage?.url)
  const isOutOfStock = quantity !== undefined && quantity <= 0

  const priceValue = (hasDiscount ? net?.min : original?.min) || 0
  const accessibleLabel = `${product.title} ราคา ${formatCurrency(priceValue)}${
    isOutOfStock ? ' สินค้าหมด' : hasDiscount ? ` ลดราคา ${maxDiscountPercent}%` : ''
  }`

  const content = (
    <article
      itemScope
      itemType="https://schema.org/Product"
      className={cn(
        productCardVariants({ variant }),
        onClick && 'cursor-pointer',
        isOutOfStock && 'opacity-60',
        className,
      )}
      onClick={onClick}
    >
      <figure className="relative overflow-hidden rounded-t-xl">
        <div className="relative mb-2.5 aspect-square w-full overflow-hidden bg-transparent">
          {!primaryImage ? (
            <EmptyImage />
          ) : isVideo ? (
            <video
              src={primaryImage.url}
              className="size-full object-cover"
              muted
              playsInline
              loop
              autoPlay
              aria-label={`วิดีโอตัวอย่างสินค้า: ${product.title}`}
            />
          ) : (
            <img
              itemProp="image"
              src={primaryImage.url}
              alt={product.title}
              loading="lazy"
              decoding="async"
              className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          )}
        </div>
        {isOutOfStock ? (
          <Badge
            variant="destructive"
            className="absolute top-2 right-2 text-xs"
          >
            <IconAlertCircle className="mr-1 size-3.5" /> ขออภัยสินค้าหมด
          </Badge>
        ) : (
          hasDiscount && (
            <Badge
              aria-label={`ลดราคา ${maxDiscountPercent}%`}
              className="bg-primary absolute top-0 right-0 size-12 rounded-full text-center"
            >
              ลด <br /> -{maxDiscountPercent}%
            </Badge>
          )
        )}
      </figure>
      <div className="flex flex-col items-center gap-1 p-1.5">
        {product.title && (
          <h3
            itemProp="name"
            className="group-hover:text-primary line-clamp-2 px-1 font-medium"
          >
            {product.title}
          </h3>
        )}
        {isReseller && (
          <Badge>
            <IconBuildingStore className="size-4" />
            ตัวแทนจำหน่าย
          </Badge>
        )}
        <div
          itemProp="offers"
          itemScope
          itemType="https://schema.org/Offer"
          className="group-hover:text-primary flex flex-col items-center justify-center"
        >
          <meta itemProp="priceCurrency" content="THB" />
          <link
            itemProp="availability"
            href={
              isOutOfStock
                ? 'https://schema.org/OutOfStock'
                : 'https://schema.org/InStock'
            }
          />
          <data
            itemProp="price"
            value={priceValue}
            className="text-primary text-lg font-bold sm:text-xl lg:text-2xl"
          >
            {formatCurrency(priceValue)}
          </data>
          {hasDiscount && (
            <span
              aria-label={`ราคาปกติ ${formatCurrency(original?.min || 0)}`}
              className="text-muted-foreground text-sm line-through"
            >
              {formatCurrency(original?.min || 0)}
            </span>
          )}
        </div>
      </div>
    </article>
  )

  if (onClick) {
    return content
  }

  return (
    <Link
      href={href || `/products/${product.slug}`}
      aria-label={accessibleLabel}
      className="block h-full"
    >
      {content}
    </Link>
  )
}
