'use client'

import { useTranslations } from 'next-intl'
import {
  IconCheck,
  IconLoader2,
  IconSparkles,
  IconWorld,
} from '@tabler/icons-react'

import { ScrapedAffiliateProductResult } from '@/actions/ai'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Field, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { AffiliatePlatform } from '@/types/affiliate-product'

interface CategoryOption {
  id: string
  title: string
}

interface AiAffiliateInputStepProps {
  isGenerating: boolean
  isScraping: boolean
  loadingStepIndex: number
  productUrl: string
  rawTitle: string
  affiliateUrl: string
  selectedCategoryId: string
  platform: AffiliatePlatform
  notes: string
  categories: CategoryOption[]
  liveScraped: ScrapedAffiliateProductResult | null
  onUrlInputChange: (val: string) => void
  onRawTitleChange: (val: string) => void
  onAffiliateUrlChange: (val: string) => void
  onCategoryChange: (val: string) => void
  onPlatformChange: (val: AffiliatePlatform) => void
  onNotesChange: (val: string) => void
  onFetchLive: () => void
  onUseLiveDirectly: () => void
  onGenerate: () => void
}

const PLATFORM_OPTIONS: { value: AffiliatePlatform; label: string }[] = [
  { value: 'SHOPEE', label: 'Shopee' },
  { value: 'LAZADA', label: 'Lazada' },
  { value: 'TIKTOK', label: 'TikTok Shop' },
  { value: 'OTHER', label: 'Other / ร้านค้าทั่วไป' },
]

export function AiAffiliateInputStep({
  isGenerating,
  isScraping,
  loadingStepIndex,
  productUrl,
  rawTitle,
  affiliateUrl,
  selectedCategoryId,
  platform,
  notes,
  categories,
  liveScraped,
  onUrlInputChange,
  onRawTitleChange,
  onAffiliateUrlChange,
  onCategoryChange,
  onPlatformChange,
  onNotesChange,
  onFetchLive,
  onUseLiveDirectly,
  onGenerate,
}: AiAffiliateInputStepProps) {
  const t = useTranslations('merchant.products.aiAffiliateDialog')

  if (isGenerating) {
    return (
      <Card className="border-primary/30 bg-primary/5 py-8 text-center">
        <CardContent className="flex flex-col items-center justify-center space-y-4">
          <div className="bg-primary/10 text-primary relative flex h-14 w-14 items-center justify-center rounded-full">
            <IconSparkles className="h-7 w-7 animate-pulse" />
          </div>
          <div className="space-y-1">
            <h4 className="text-foreground text-base font-semibold">
              {t('loadingTitle')}
            </h4>
            <p className="text-muted-foreground text-sm">
              {loadingStepIndex === 1 ? t('loadingStep1') : t('loadingStep2')}
            </p>
          </div>
          <div className="text-primary flex items-center gap-2 text-xs">
            <IconLoader2 className="h-4 w-4 animate-spin" />
            <span>{t('generating')}</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <Field>
        <FieldLabel className="flex flex-wrap items-center justify-between gap-1.5">
          <span>{t('productUrlLabel')} *</span>
          <div className="flex flex-wrap items-center gap-1 sm:gap-1.5">
            <Badge
              variant="outline"
              className="bg-[#EE4D2D]/10 text-[9px] text-[#EE4D2D] sm:text-[10px]"
            >
              Shopee
            </Badge>
            <Badge
              variant="outline"
              className="bg-[#0F146D]/10 text-[9px] text-[#0F146D] sm:text-[10px] dark:text-blue-400"
            >
              Lazada
            </Badge>
            <Badge
              variant="outline"
              className="bg-black/10 text-[9px] text-black sm:text-[10px] dark:bg-white/10 dark:text-white"
            >
              TikTok Shop
            </Badge>
          </div>
        </FieldLabel>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Input
            type="text"
            placeholder={t('productUrlPlaceholder')}
            value={productUrl}
            onChange={(e) => onUrlInputChange(e.target.value)}
            autoFocus
            className="flex-1 text-xs sm:text-sm"
          />
          <Button
            type="button"
            variant="secondary"
            disabled={!productUrl.trim() || isScraping}
            onClick={onFetchLive}
            className="h-9 shrink-0 gap-1.5 text-xs sm:h-10 sm:text-sm"
          >
            {isScraping ? (
              <>
                <IconLoader2 className="h-4 w-4 animate-spin" />
                <span>{t('fetchingLive')}</span>
              </>
            ) : (
              <>
                <IconWorld className="h-4 w-4 text-emerald-500" />
                <span>{t('fetchLiveBtn')}</span>
              </>
            )}
          </Button>
        </div>
        <p className="text-muted-foreground text-xs">{t('productUrlHelp')}</p>
      </Field>

      {/* Live Web Data Card Preview */}
      {liveScraped && (
        <div className="space-y-3 rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-3 sm:p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-medium text-emerald-600 dark:text-emerald-400">
              <IconCheck className="h-4 w-4" />
              <span>
                {t('liveDataFound')} ({liveScraped.platform})
              </span>
            </div>
            {liveScraped.price ? (
              <Badge variant="secondary" className="text-xs font-semibold">
                ฿{liveScraped.price.toLocaleString()}
              </Badge>
            ) : null}
          </div>

          <div className="flex items-start gap-3 sm:items-center">
            {liveScraped.image && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={liveScraped.image}
                alt={liveScraped.title || ''}
                className="bg-background h-16 w-16 shrink-0 rounded-lg border object-cover"
              />
            )}
            <div className="min-w-0 flex-1 space-y-1">
              <p className="line-clamp-2 text-xs leading-tight font-semibold sm:text-sm">
                {liveScraped.title}
              </p>
              <p className="text-muted-foreground line-clamp-2 text-xs">
                {liveScraped.description ||
                  'ตรวจพบข้อมูลสเปกและรายละเอียดสินค้าครบถ้วนจากหน้าเว็บจริง'}
              </p>
              <div className="text-muted-foreground flex items-center gap-2 pt-0.5 text-[11px]">
                <span>
                  {t('liveImagesCount', {
                    count: liveScraped.images.length || 1,
                  })}
                </span>
                {liveScraped.videoUrl && <span>• มีวิดีโอ</span>}
              </div>
            </div>
          </div>

          <div className="flex flex-col-reverse items-stretch justify-end gap-2 border-t border-emerald-500/20 pt-2 sm:flex-row sm:items-center">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onUseLiveDirectly}
              className="h-8 w-full gap-1.5 text-xs sm:w-auto"
            >
              <span>{t('useDirectlyBtn')}</span>
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={onGenerate}
              disabled={isGenerating}
              className="h-8 w-full gap-1.5 text-xs sm:w-auto"
            >
              <IconSparkles className="h-3.5 w-3.5" />
              <span>{t('generateBtn')}</span>
            </Button>
          </div>
        </div>
      )}

      {/* Product Title / Information */}
      <Field>
        <FieldLabel>{t('rawTitleLabel')}</FieldLabel>
        <Input
          placeholder={t('rawTitlePlaceholder')}
          value={rawTitle}
          onChange={(e) => onRawTitleChange(e.target.value)}
        />
      </Field>

      <Field>
        <FieldLabel>{t('affiliateUrlLabel')}</FieldLabel>
        <Input
          type="url"
          placeholder={t('affiliateUrlPlaceholder')}
          value={affiliateUrl}
          onChange={(e) => onAffiliateUrlChange(e.target.value)}
        />
        <p className="text-muted-foreground text-xs">
          {t('affiliateUrlHelp')}
        </p>
      </Field>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field>
          <FieldLabel>{t('categoryLabel')} *</FieldLabel>
          <Select
            value={selectedCategoryId}
            onValueChange={onCategoryChange}
          >
            <SelectTrigger>
              <SelectValue placeholder={t('categoryPlaceholder')} />
            </SelectTrigger>
            <SelectContent>
              {categories.map((cat) => (
                <SelectItem key={cat.id} value={cat.id}>
                  {cat.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>

        <Field>
          <FieldLabel>{t('fieldPlatform')}</FieldLabel>
          <Select
            value={platform}
            onValueChange={(val) => onPlatformChange(val as AffiliatePlatform)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PLATFORM_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
      </div>

      <Field>
        <FieldLabel>{t('notesLabel')}</FieldLabel>
        <Textarea
          placeholder={t('notesPlaceholder')}
          value={notes}
          onChange={(e) => onNotesChange(e.target.value)}
          rows={2}
        />
      </Field>
    </div>
  )
}
