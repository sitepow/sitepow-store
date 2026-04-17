import Link from 'next/link'

import { Product } from '@/types/sites/product'
import { formatCurrency } from '@/utils/pricing'
import { calculateProduct } from '@/utils/product'
import { type VariantProps, cva } from 'class-variance-authority'

import { Badge } from '@/components/ui/badge'

import { cn } from '@/lib/utils'

const productCardVariants = cva(
  'h-full rounded-xl transition-all group hover:border hover:border-primary/50',
  {
    variants: {
      variant: {
        outline: 'border border-gray-100',
        shadow: 'shadow-airy ',
      },
    },
  },
)

interface ProductCardProps
  extends Product, VariantProps<typeof productCardVariants> {
  className?: string
}

export function ProductCard({
  variant,
  className,
  ...product
}: ProductCardProps) {
  const { hasDiscount, net, maxDiscountPercent } = calculateProduct(product)

  return (
    <Link href={`/products/${product.slug}`}>
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

        <h3 className="group-hover:text-primary line-clamp-2">
          {product.title}
        </h3>

        {hasDiscount && (
          <span className="text-muted-foreground group-hover:text-primary text-sm line-through">
            {formatCurrency(net?.min || 0)}
          </span>
        )}

        <div className="group-hover:text-primary flex items-end justify-center gap-2">
          <data value={net?.min} className="text-2xl font-bold">
            {formatCurrency(net?.min || 0)}
          </data>
          <span className="mb-0.5 text-sm font-bold">THB</span>
        </div>
      </div>
    </Link>
  )
}
