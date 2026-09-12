'use client'

import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'

import { useTranslations } from 'next-intl'
import Link from 'next/link'
import { usePathname, useSearchParams } from 'next/navigation'

import { useCustomerAffiliateDashboard } from '@/actions/hooks/storefront/affiliate'
import { UserRole } from '@/generated/prisma/enums'
import { formatCurrency } from '@/utils/pricing'
import {
  IconCheck,
  IconCoin,
  IconCopy,
  IconExternalLink,
  IconShare,
  IconSparkles,
} from '@tabler/icons-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'

import { useProductPurchaseStore } from '../../store'

interface ProductAffiliateShareProps {
  storeSlug: string
  productSlug: string
}

export function ProductAffiliateShare({
  storeSlug,
  productSlug,
}: ProductAffiliateShareProps) {
  const t = useTranslations('storefront.products.affiliateShare')
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const { data, isLoading } = useCustomerAffiliateDashboard(storeSlug)
  const { product, selectedVariant, getTotalPrice, getVariantPrice } =
    useProductPurchaseStore()

  const [copied, setCopied] = useState(false)
  const [origin, setOrigin] = useState('')

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setOrigin(window.location.origin)
    }
  }, [])

  if (isLoading) {
    return <Skeleton className="h-28 w-full rounded-2xl" />
  }

  const isEnabled = data?.isEnabled ?? false
  const rate = Number(data?.setting?.defaultCommissionRate ?? 0)

  // If affiliate is not enabled or commission rate is 0, do not display
  if (!isEnabled || rate <= 0) {
    return null
  }

  const account = data?.account
  const isAuthenticated = data?.isAuthenticated ?? false

  // Determine current effective price from selected variant/options or base product
  const currentPrice =
    getTotalPrice() ||
    (selectedVariant ? getVariantPrice(selectedVariant) : 0) ||
    Number(product?.variants?.[0]?.price ?? 0)

  const commissionAmount = (currentPrice * rate) / 100

  // Referral link
  const referralUrl = account?.referralCode
    ? `${origin}/products/${productSlug}?ref=${account.referralCode}`
    : ''

  // Login link with callbackUrl
  const currentUrl = `${pathname}${searchParams.toString() ? `?${searchParams.toString()}` : ''}`
  const loginParams = new URLSearchParams()
  loginParams.set('role', UserRole.CUSTOMER)
  if (currentUrl && currentUrl !== '/') {
    loginParams.set('callbackUrl', currentUrl)
  }
  const loginHref = `/login?${loginParams.toString()}`

  const handleCopy = () => {
    if (!referralUrl) return
    navigator.clipboard.writeText(referralUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
    toast.success(t('linkCopiedToast'))
  }

  const handleShare = async () => {
    if (!referralUrl) return
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: t('shareTitle', { title: product?.title || '' }),
          text: t('shareText', { title: product?.title || '' }),
          url: referralUrl,
        })
        return
      } catch (err: any) {
        if (err?.name === 'AbortError') return
      }
    }
    handleCopy()
  }

  return (
    <div className="border-primary/25 from-primary/10 via-primary/[0.03] to-background relative overflow-hidden rounded-2xl border bg-gradient-to-br p-4 shadow-sm transition-all">
      {/* Decorative Glow */}
      <div className="bg-primary/15 absolute -top-8 -right-8 size-28 rounded-full blur-xl" />

      {/* Header Info */}
      <div className="relative flex flex-col gap-3">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="bg-primary/15 text-primary flex size-7 items-center justify-center rounded-lg">
              <IconSparkles className="size-4" />
            </span>
            <span className="text-foreground text-xs font-bold sm:text-sm">
              {t('badge')}
            </span>
          </div>

          {account?.referralCode && (
            <Badge
              variant="outline"
              className="border-primary/30 bg-primary/10 text-primary text-[11px] font-bold"
            >
              {account.referralCode}
            </Badge>
          )}
        </div>

        {/* Commission Callout */}
        <div className="space-y-1">
          <p className="text-muted-foreground text-xs font-medium">
            {t('earnCommission')}
          </p>
          <div className="flex flex-wrap items-baseline gap-2">
            <span className="text-primary text-2xl font-black tracking-tight sm:text-3xl">
              +{formatCurrency(commissionAmount)}
            </span>
            <span className="text-muted-foreground text-xs font-semibold">
              {t('perOrder', { rate })}
            </span>
          </div>
          <p className="text-muted-foreground text-[11px]">
            {t('calculatedFrom', {
              rate,
              price: formatCurrency(currentPrice),
            })}
          </p>
        </div>

        {/* Action Controls */}
        {isAuthenticated && account ? (
          <div className="space-y-2.5 pt-1">
            {/* Quick Copy URL Row */}
            <div className="flex items-center gap-1.5">
              <Input
                readOnly
                value={referralUrl}
                className="bg-background/80 h-9 text-xs font-medium"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleCopy}
                className="h-9 shrink-0 gap-1 font-semibold"
              >
                {copied ? (
                  <>
                    <IconCheck className="size-3.5 text-emerald-600" />
                    <span>{t('copied')}</span>
                  </>
                ) : (
                  <>
                    <IconCopy className="size-3.5" />
                    <span>{t('copyBtn')}</span>
                  </>
                )}
              </Button>
            </div>

            {/* Share and View Dashboard Actions */}
            <div className="flex items-center justify-between gap-2 pt-0.5">
              <Button
                type="button"
                size="sm"
                onClick={handleShare}
                className="h-9 flex-1 gap-1.5 font-bold shadow-xs"
              >
                <IconShare className="size-4" />
                <span>{t('shareBtn')}</span>
              </Button>

              <Button
                asChild
                variant="ghost"
                size="sm"
                className="text-primary hover:text-primary h-9 text-xs font-semibold"
              >
                <Link
                  href="/user/affiliate"
                  className="inline-flex items-center gap-1"
                >
                  <span>{t('viewEarnings')}</span>
                  <IconExternalLink className="size-3.5" />
                </Link>
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-2 pt-1">
            <p className="text-muted-foreground text-xs">
              {t('loginPrompt', { amount: formatCurrency(commissionAmount) })}
            </p>
            <Button asChild className="h-10 w-full gap-2 font-bold shadow-xs">
              <Link href={loginHref}>
                <IconCoin className="size-4" />
                <span>{t('loginBtn')}</span>
              </Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
