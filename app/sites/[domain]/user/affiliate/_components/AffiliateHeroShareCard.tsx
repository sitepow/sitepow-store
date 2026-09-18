'use client'

import { useState } from 'react'
import toast from 'react-hot-toast'

import { useTranslations } from 'next-intl'

import {
  IconCheck,
  IconCopy,
  IconLink,
  IconShare,
  IconSparkles,
} from '@tabler/icons-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface ProductOption {
  id: string
  slug: string
  title: string
}

interface AffiliateHeroShareCardProps {
  commissionRate: number
  referralCode?: string
  storeReferralLink: string
  products: ProductOption[]
  selectedProductSlug: string
  onSelectProductSlug: (slug: string) => void
  productReferralLink: string
}

export function AffiliateHeroShareCard({
  commissionRate,
  referralCode,
  storeReferralLink,
  products,
  selectedProductSlug,
  onSelectProductSlug,
  productReferralLink,
}: AffiliateHeroShareCardProps) {
  const t = useTranslations('customer.affiliate')
  const [copiedLink, setCopiedLink] = useState(false)
  const [copiedProductLink, setCopiedProductLink] = useState(false)

  const handleCopy = (text: string, isProduct = false) => {
    if (!text) return
    navigator.clipboard.writeText(text)
    if (isProduct) {
      setCopiedProductLink(true)
      setTimeout(() => setCopiedProductLink(false), 2000)
    } else {
      setCopiedLink(true)
      setTimeout(() => setCopiedLink(false), 2000)
    }
    toast.success(t('toasts.linkCopied'))
  }

  return (
    <Card className="border-primary/20 from-primary/5 via-card to-card relative overflow-hidden bg-linear-to-br shadow-sm">
      <div className="bg-primary/10 absolute -top-12 -right-12 size-48 rounded-full blur-2xl" />
      <CardHeader className="pb-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="bg-primary/10 text-primary flex size-8 items-center justify-center rounded-lg">
              <IconSparkles className="size-4.5" />
            </span>
            <div>
              <CardTitle className="text-base sm:text-lg">
                {t('commissionBanner', { rate: commissionRate })}
              </CardTitle>
              <CardDescription className="text-xs">
                {t('commissionBannerDesc')}
              </CardDescription>
            </div>
          </div>

          <Badge
            variant="outline"
            className="border-primary/30 bg-primary/10 text-primary px-3 py-1 text-xs font-bold"
          >
            {t('referralCode', { code: referralCode ?? '' })}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="space-y-1.5">
          <Label className="text-muted-foreground text-xs font-semibold">
            {t('storeLink')}
          </Label>
          <div className="flex items-center gap-2">
            <Input
              readOnly
              value={storeReferralLink}
              className="bg-background text-xs font-medium"
            />
            <Button
              type="button"
              onClick={() => handleCopy(storeReferralLink)}
              className="shrink-0 gap-1.5 font-bold"
            >
              {copiedLink ? (
                <>
                  <IconCheck className="size-4 text-emerald-300" />
                  {t('copied')}
                </>
              ) : (
                <>
                  <IconCopy className="size-4" />
                  {t('copyLink')}
                </>
              )}
            </Button>
          </div>
        </div>

        {products.length > 0 && (
          <div className="border-border/60 bg-muted/20 space-y-2 rounded-xl border p-3 sm:p-4">
            <div className="flex items-center gap-2">
              <IconLink className="text-primary size-4" />
              <span className="text-foreground text-xs font-bold">
                {t('generateProductLink')}
              </span>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row">
              <Select
                value={selectedProductSlug}
                onValueChange={onSelectProductSlug}
              >
                <SelectTrigger className="bg-background text-xs sm:text-sm">
                  <SelectValue placeholder={t('selectProduct')} />
                </SelectTrigger>
                <SelectContent>
                  {products.map((p) => (
                    <SelectItem key={p.id} value={p.slug}>
                      {p.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button
                type="button"
                variant="secondary"
                disabled={!selectedProductSlug}
                onClick={() => handleCopy(productReferralLink, true)}
                className="shrink-0 gap-1.5 font-bold"
              >
                {copiedProductLink ? (
                  <>
                    <IconCheck className="size-4 text-emerald-600" />
                    {t('copied')}
                  </>
                ) : (
                  <>
                    <IconShare className="size-4" />
                    {t('copyProductLink')}
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
