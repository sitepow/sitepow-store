'use client'
import { useTranslations } from 'next-intl'
import Link from 'next/link'

import { MainHeroHeader } from '@/app/(main)/_components/MainHeroHeader'
import { useIsMounted } from '@/hooks/use-is-mounted'
import {
  IconCheck,
  IconClockCheck,
  IconHeadset,
  IconPackage,
  IconPercentage,
  IconServer,
} from '@tabler/icons-react'

export function BuyoutHeroSection() {
  const isMounted = useIsMounted()
  const t = useTranslations('buyout')

  const titleStart =
    (t.raw('hero.titleStart') as string) || 'เป็นเจ้าของระบบอย่างแท้จริง'
  const titleGradient =
    (t.raw('hero.titleGradient') as string) ||
    'จ่ายครั้งเดียวจบ ไร้ค่าบริการรายเดือน'

  return (
    <MainHeroHeader
      badgeIcon={<IconServer className="size-4" />}
      badgeText={t('hero.badge')}
      title={
        <>
          {titleStart}{' '}
          <span className="from-primary bg-linear-to-r via-orange-500 to-amber-500 bg-clip-text text-transparent drop-shadow-xs">
            {titleGradient}
          </span>
        </>
      }
      description={t('hero.description')}
    >
      {/* Switcher between Monthly and Buyout */}
      {isMounted && (
        <div className="space-y-4 pt-1 sm:pt-2">
          <div className="flex justify-center">
            <div className="bg-muted/70 border-border/80 inline-flex max-w-full flex-wrap items-center justify-center gap-1 rounded-xl border p-1 shadow-xs sm:rounded-2xl sm:p-1.5">
              <Link
                href="/pricing"
                className="text-muted-foreground hover:text-foreground flex cursor-pointer items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all sm:rounded-xl sm:px-4 sm:py-2 sm:text-sm"
              >
                <IconPackage className="size-4" />
                <span>{t('hero.switchToMonthly')}</span>
              </Link>
              <div className="bg-background text-foreground flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold shadow-sm sm:rounded-xl sm:px-4 sm:py-2 sm:text-sm">
                <IconServer className="text-primary size-4" />
                <span>{t('hero.switchToBuyout')}</span>
                <span className="bg-primary/15 text-primary rounded-full px-2 py-0.5 text-[10px] font-bold">
                  Hot!
                </span>
              </div>
            </div>
          </div>

          {/* Quick Trust Highlights */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-2 text-[11px] sm:gap-3 sm:text-xs">
            <div className="border-border/60 bg-card/70 text-foreground/90 inline-flex items-center gap-1.5 rounded-full border px-3 py-1 font-medium shadow-2xs">
              <IconServer className="size-3.5 text-emerald-500" />
              <span>{t('trustBadges.freeInstallation')}</span>
            </div>
            <div className="border-border/60 bg-card/70 text-foreground/90 inline-flex items-center gap-1.5 rounded-full border px-3 py-1 font-medium shadow-2xs">
              <IconHeadset className="size-3.5 text-emerald-500" />
              <span>{t('trustBadges.freeSupport')}</span>
            </div>
            <div className="border-border/60 bg-card/70 text-foreground/90 inline-flex items-center gap-1.5 rounded-full border px-3 py-1 font-medium shadow-2xs">
              <IconPercentage className="size-3.5 text-emerald-500" />
              <span>{t('trustBadges.zeroGp')}</span>
            </div>
            <div className="border-border/60 bg-card/70 text-foreground/90 inline-flex items-center gap-1.5 rounded-full border px-3 py-1 font-medium shadow-2xs">
              <IconCheck className="size-3.5 text-emerald-500" />
              <span>{t('trustBadges.dataOwnership')}</span>
            </div>
          </div>
        </div>
      )}
    </MainHeroHeader>
  )
}
