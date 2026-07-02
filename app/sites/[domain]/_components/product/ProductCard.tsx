import Link from 'next/link'

import { SectionProductItem } from '@/actions/storefront/sections'
import { formatCurrency } from '@/utils/pricing'
import { calculateProduct } from '@/utils/product'
import { type VariantProps, cva } from 'class-variance-authority'

import { Badge } from '@/components/ui/badge'

import { cn } from '@/lib/utils'

const productCardVariants = cva(
  'h-full rounded-xl transition-all pb-5 dark:bg-foreground/5 text-foreground group hover:border hover:border-primary/50',
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

  return (
    <Link href={`/products/${product.slug}`}>
      <div className={cn(productCardVariants({ variant }), className)}>
        <div className="relative">
          <div className="bg-foreground/20 mb-2.5 h-52 w-full rounded-xl" />
          {hasDiscount && (
            <Badge className="absolute top-0 right-0 size-12 rounded-full text-center">
              ลด
              <br />
              {maxDiscountPercent}%
            </Badge>
          )}
        </div>

        <h3 className="group-hover:text-primary line-clamp-2 px-5">
          {product.title}
        </h3>

        <div className="group-hover:text-primary mt-2 flex items-end justify-center gap-2">
          {hasDiscount ? (
            <>
              <span className="text-muted-foreground text-sm line-through">
                {formatCurrency(original?.min || 0)}
              </span>
              <data value={net?.min} className="text-2xl font-bold">
                {formatCurrency(net?.min || 0)}
              </data>
            </>
          ) : (
            <data value={original?.min} className="text-2xl font-bold">
              {formatCurrency(original?.min || 0)}
            </data>
          )}
        </div>
      </div>
    </Link>
  )
}
