/* eslint-disable @next/next/no-img-element */
'use client'

import { useTranslations } from 'next-intl'
import Link from 'next/link'

import { SectionProductItem } from '@/actions/storefront/sections'
import { isVideoUrl } from '@/utils/media'
import { formatCurrency } from '@/utils/pricing'
import { calculateProduct } from '@/utils/product'
import { IconAlertCircle, IconBuildingStore } from '@tabler/icons-react'
import { type VariantProps, cva } from 'class-variance-authority'
import { ExternalLink } from 'lucide-react'

import { Badge } from '@/components/ui/badge'

import { cn } from '@/lib/utils'

import { EmptyImage } from '../EmptyImage'

const productCardVariants = cva(
  'h-full rounded-xl shadow-airy transition-all border pb-2.5 dark:bg-foreground/5 text-foreground group hover:border hover:border-primary/50',
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
  const t = useTranslations('storefront.products')
  const { hasDiscount, net, original, maxDiscountPercent } =
    calculateProduct(product)

  const isAffiliate = product.productType === 'AFFILIATE_LINK'
  const primaryImage = product.images?.[0]
  const isVideo = isVideoUrl(primaryImage?.url)
  const isOutOfStock = !isAffiliate && quantity !== undefined && quantity <= 0

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
        <div className="relative mb-2.5 aspect-square w-full overflow-hidden bg-transparent">
          {!primaryImage ? (
            <EmptyImage text={product.title} />
          ) : isVideo ? (
            <video
              src={primaryImage.url}
              className="size-full object-cover"
              muted
              playsInline
              loop
              autoPlay
            />
          ) : (
            <img
              src={primaryImage.url}
              alt={product.title}
              className="size-full object-cover"
            />
          )}
        </div>
        {isAffiliate && (
          <Badge className="absolute top-2 left-2 flex items-center gap-1 bg-amber-500 text-[10px] font-semibold text-white shadow-sm hover:bg-amber-600">
            <ExternalLink className="size-3" />
            {t('affiliateBuy.badge')}
          </Badge>
        )}
        {isOutOfStock ? (
          <Badge
            variant="destructive"
            className="absolute top-2 right-2 text-xs"
          >
            <IconAlertCircle /> {t('outOfStock')}
          </Badge>
        ) : (
          hasDiscount && (
            <Badge className="bg-primary absolute top-0 right-0 size-12 rounded-full border border-white text-center">
              {t('discountOff')} <br /> -{maxDiscountPercent}%
            </Badge>
          )
        )}
      </div>
      <div className="flex flex-col items-center gap-1 p-1.5">
        {product.title && (
          <h3 className="group-hover:text-primary line-clamp-2 px-1 font-medium">
            {product.title}
          </h3>
        )}
        {isReseller && (
          <Badge>
            <IconBuildingStore className="size-4" />
            {t('reseller')}
          </Badge>
        )}
        <div className="group-hover:text-primary flex flex-col items-center justify-center">
          <data
            value={hasDiscount ? net?.min : original?.min}
            className="text-primary text-lg font-bold sm:text-xl lg:text-2xl"
          >
            {formatCurrency((hasDiscount ? net?.min : original?.min) || 0)}
          </data>
          {hasDiscount && (
            <span className="text-muted-foreground text-sm line-through">
              {formatCurrency(original?.min || 0)}
            </span>
          )}
        </div>
      </div>
    </div>
  )

  if (onClick) {
    return content
  }

  return <Link href={href || `/products/${product.slug}`}>{content}</Link>
}
