import Link from 'next/link'

import { Product } from '@/types/sites/product'
import { type VariantProps, cva } from 'class-variance-authority'

import { Badge } from '@/components/ui/badge'

import { formatCurrency } from '@/lib/pricing'
import { useCalculateProduct } from '@/lib/product'
import { cn } from '@/lib/utils'

const productCardVariants = cva('h-full rounded-xl transition-all', {
  variants: {
    variant: {
      outline: 'border border-gray-100',
      shadow: 'shadow-airy',
    },
  },
})

interface ProductCardProps
  extends Product, VariantProps<typeof productCardVariants> {
  className?: string
}

export function ProductCard({
  variant,
  className,
  ...product
}: ProductCardProps) {
  const { hasDiscount, price, maxDiscountPercent } =
    useCalculateProduct(product)

  return (
    <Link href="/product">
      <div className={cn(productCardVariants({ variant }), className)}>
        <div className="relative">
          <div className="mb-2.5 h-52 w-full rounded-xl bg-gray-200" />
          {hasDiscount && (
            <Badge className="absolute top-0 right-0 size-14 rounded-full text-center">
              OFF
              <br />
              {maxDiscountPercent}%
            </Badge>
          )}
        </div>

        <h3 className="line-clamp-2">{product.title}</h3>

        {hasDiscount && (
          <span className="text-muted-foreground text-sm line-through">
            {formatCurrency(price?.original?.min || 0)}
          </span>
        )}

        <div className="flex items-end justify-center gap-2">
          <data value={price?.net?.min} className="text-2xl font-bold">
            {formatCurrency(price?.net?.min || 0)}
          </data>
          <span className="mb-0.5 text-sm font-bold">THB</span>
        </div>
      </div>
    </Link>
  )
}
