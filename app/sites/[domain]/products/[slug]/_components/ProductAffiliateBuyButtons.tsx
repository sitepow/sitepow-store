'use client'

import { useTranslations } from 'next-intl'

import { StorefrontProductDetail } from '@/actions/storefront/product'
import {
  AFFILIATE_PLATFORM_CONFIG,
  AffiliatePlatform,
  AffiliateProductLink,
} from '@/types/affiliate-product'
import { formatCurrency } from '@/utils/pricing'
import { ExternalLink, Tag } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

interface Props {
  product: StorefrontProductDetail
}

export function ProductAffiliateBuyButtons({ product }: Props) {
  const t = useTranslations('storefront.products.affiliateBuy')

  const rawLinks = (product?.details as any)?.affiliateLinks
  let links: AffiliateProductLink[] = Array.isArray(rawLinks) ? rawLinks : []

  // Fallback if no structured affiliate links exist but digitalUrl is in the variant
  if (links.length === 0 && product?.variants?.[0]?.digitalUrl) {
    const fallbackUrl = product.variants[0].digitalUrl
    let platform: AffiliatePlatform = 'OTHER'
    const lowerUrl = fallbackUrl.toLowerCase()
    if (lowerUrl.includes('shopee.')) platform = 'SHOPEE'
    else if (lowerUrl.includes('lazada.')) platform = 'LAZADA'
    else if (lowerUrl.includes('tiktok.')) platform = 'TIKTOK'

    const price = Number(product.variants[0].price || 0)
    links = [
      {
        id: 'fallback-1',
        platform,
        url: fallbackUrl,
        label: product.variants[0].title || undefined,
        price,
      },
    ]
  }

  const handleOpenLink = (url: string) => {
    if (!url) return
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  if (links.length === 0) {
    return null
  }

  return (
    <div className="bg-muted/15 space-y-4 rounded-xl border p-4 sm:p-5">
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <Badge className="bg-primary/90 text-primary-foreground text-xs font-semibold">
            {t('badge')}
          </Badge>
          <span className="text-muted-foreground text-xs font-medium">
            {t('availableDeals', { count: links.length })}
          </span>
        </div>
        <h3 className="text-foreground text-base font-bold sm:text-lg">
          {t('title')}
        </h3>
        <p className="text-muted-foreground text-xs">{t('description')}</p>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {links.map((link, idx) => {
          const platform = link.platform || 'OTHER'
          const config =
            AFFILIATE_PLATFORM_CONFIG[platform] ||
            AFFILIATE_PLATFORM_CONFIG.OTHER

          const price = link.price ?? Number(product.variants?.[0]?.price ?? 0)
          const originalPrice = link.originalPrice
          const hasDiscount =
            Boolean(
              link.isDiscounted && originalPrice && originalPrice > price,
            ) || Boolean(originalPrice && originalPrice > price)
          const discountSavings =
            hasDiscount && originalPrice ? originalPrice - price : 0

          return (
            <Card
              key={link.id || idx}
              className={`border transition-all duration-200 hover:shadow-md ${config.borderClass} overflow-hidden`}
            >
              <CardContent className="flex flex-col justify-between gap-3 p-3.5 sm:flex-row sm:items-center sm:p-4">
                <div className="min-w-0 space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge
                      className={`${config.badgeClass} text-xs font-semibold`}
                    >
                      {config.name}
                    </Badge>
                    {link.label && (
                      <span className="text-foreground truncate text-sm font-semibold">
                        {link.label}
                      </span>
                    )}
                    {(link.discountText || hasDiscount) && (
                      <Badge
                        variant="secondary"
                        className="bg-destructive/10 text-destructive flex items-center gap-1 text-[11px] font-medium"
                      >
                        <Tag className="size-3" />
                        {link.discountText || t('onSale')}
                      </Badge>
                    )}
                  </div>

                  <div className="flex items-baseline gap-2">
                    <span className="text-primary text-xl font-bold sm:text-2xl">
                      {formatCurrency(price)}
                    </span>
                    {hasDiscount && originalPrice && (
                      <span className="text-muted-foreground text-xs line-through">
                        {formatCurrency(originalPrice)}
                      </span>
                    )}
                    {discountSavings > 0 && (
                      <span className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                        {t('saveAmount', {
                          amount: formatCurrency(discountSavings),
                        })}
                      </span>
                    )}
                  </div>
                </div>

                <div className="sm:shrink-0">
                  <Button
                    type="button"
                    onClick={() => handleOpenLink(link.url)}
                    className="w-full font-semibold shadow-sm transition-transform active:scale-95 sm:w-auto"
                    style={{
                      backgroundColor: config.color,
                      color: '#ffffff',
                    }}
                  >
                    <span>{t('buyOn', { platform: config.name })}</span>
                    <ExternalLink className="ml-1.5 size-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <p className="text-muted-foreground pt-1 text-center text-[11px] sm:text-left">
        {t('externalNotice', {
          platform:
            links.length === 1
              ? AFFILIATE_PLATFORM_CONFIG[links[0].platform || 'OTHER']?.name ||
                'ร้านค้า'
              : 'แพลตฟอร์มพาร์ทเนอร์',
        })}
      </p>
    </div>
  )
}
