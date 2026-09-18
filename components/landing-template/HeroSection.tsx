'use client'

import { useMemo, useRef } from 'react'

import { useTranslations } from 'next-intl'
import Link from 'next/link'

import { UserRole } from '@/generated/prisma/enums'
import { useIsMounted } from '@/hooks/use-is-mounted'
import { useSession } from '@/hooks/use-session'
import {
  IconAlertTriangle,
  IconArrowRight,
  IconBolt,
  IconBuildingStore,
  IconCheck,
  IconDeviceLaptop,
  IconQrcode,
  IconReceipt2,
  IconStarFilled,
  IconTrendingUp,
  IconWifiOff,
} from '@tabler/icons-react'
import { ArrowRight } from 'lucide-react'

import { AnimatedGridPattern } from '@/components/magicui/animated-grid-pattern'
import { AnimatedShinyText } from '@/components/magicui/animated-shiny-text'
import { BorderBeam } from '@/components/magicui/border-beam'
import { RainbowButton } from '@/components/magicui/rainbow-button'
import { Safari } from '@/components/magicui/safari'
import { Button } from '@/components/ui/button'

import { ScrollTrigger, gsap, useGSAP } from '@/lib/gsap'
import { getManageUrl } from '@/lib/manage-url'
import { cn } from '@/lib/utils'

const REGISTER_HREF = `/register?role=${UserRole.MERCHANT}&callbackUrl=%2Fmerchant%2Fdashboard`

export interface HeroSectionProps {
  badgeNew?: string
  badgeText?: string
  titleStart?: string
  titleGradient?: string
  description?: string
  registerBtn?: string
  manageStoreBtn?: string
  downloadPosBtn?: string
  ratingText?: string
  trust1?: string
  trust2?: string
  trust3?: string
  trust4?: string
  floatSalesTitle?: string
  floatSalesAmount?: string
  floatSalesGrowth?: string
  floatQrTitle?: string
  floatQrDesc?: string
  floatStockTitle?: string
  floatStockDesc?: string
  floatOfflineTitle?: string
  floatOfflineDesc?: string
  floatSpeedTitle?: string
  floatSpeedDesc?: string
  floatOrderTitle?: string
  floatOrderDesc?: string
  floatCloudSyncText?: string
}

export function HeroSection(props: HeroSectionProps = {}) {
  const isMounted = useIsMounted()
  const t = useTranslations('home.hero')
  const { isAuthenticated } = useSession()
  const isAuth = isMounted && isAuthenticated

  const heroRef = useRef<HTMLElement>(null)
  const mockupInnerRef = useRef<HTMLDivElement>(null)

  const data = useMemo(() => {
    return {
      badgeNew: props.badgeNew ?? t('badgeNew'),
      badgeText: props.badgeText ?? t('badgeText', { gp: 0 }),
      titleStart: props.titleStart ?? t('titleStart'),
      titleGradient: props.titleGradient ?? t('titleGradient'),
      description: props.description ?? t('description'),
      registerBtn: props.registerBtn ?? t('registerBtn'),
      manageStoreBtn: props.manageStoreBtn ?? t('manageStoreBtn'),
      downloadPosBtn: props.downloadPosBtn ?? t('downloadPosBtn'),
      ratingText:
        props.ratingText ??
        t('ratingText', { rating: '4.9', merchants: '1,200' }),
      trusts: [
        props.trust1 ?? t('trust1', { gp: 0 }),
        props.trust2 ?? t('trust2'),
        props.trust3 ?? t('trust3', { minutes: 3 }),
        props.trust4 ?? t('trust4'),
      ].filter(Boolean),
      floating: {
        salesTitle: props.floatSalesTitle ?? t('floating.salesTodayTitle'),
        salesAmount:
          props.floatSalesAmount ??
          t('floating.salesTodayAmount', { amount: '24,850' }),
        salesGrowth:
          props.floatSalesGrowth ??
          t('floating.salesTodayGrowth', { rate: '32.4' }),
        qrTitle: props.floatQrTitle ?? t('floating.qrTitle'),
        qrDesc: props.floatQrDesc ?? t('floating.qrDesc', { gpRate: 0 }),
        stockTitle: props.floatStockTitle ?? t('floating.stockTitle'),
        stockDesc:
          props.floatStockDesc ??
          t('floating.stockDesc', { item: 'House Blend', count: 3 }),
        offlineTitle: props.floatOfflineTitle ?? t('floating.offlineTitle'),
        offlineDesc: props.floatOfflineDesc ?? t('floating.offlineDesc'),
        speedTitle:
          props.floatSpeedTitle ?? t('floating.speedTitle', { time: '0.2' }),
        speedDesc: props.floatSpeedDesc ?? t('floating.speedDesc'),
        orderTitle:
          props.floatOrderTitle ??
          t('floating.orderTitle', { orderNo: 'A-128' }),
        orderDesc: props.floatOrderDesc ?? t('floating.orderDesc'),
        cloudSyncText: props.floatCloudSyncText ?? t('floating.cloudSyncText'),
      },
    }
  }, [t, props])

  useGSAP(
    () => {
      if (!isMounted || !heroRef.current) {
        return
      }

      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })
      const textElements = heroRef.current.querySelectorAll(
        '[data-animate="hero-text"]',
      )
      const floatCards = heroRef.current.querySelectorAll(
        '[data-animate="float-card"]',
      )

      if (textElements.length > 0) {
        tl.fromTo(
          textElements,
          { y: 25, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.75, stagger: 0.1 },
        )
      }

      if (mockupInnerRef.current) {
        tl.fromTo(
          mockupInnerRef.current,
          { rotateX: 16, scale: 0.92, opacity: 0 },
          { rotateX: 5, scale: 1, opacity: 1, duration: 1, ease: 'power2.out' },
          '-=0.4',
        )

        gsap.to(mockupInnerRef.current, {
          rotateX: 0,
          y: -30,
          ease: 'none',
          scrollTrigger: {
            trigger: heroRef.current,
            start: 'top top',
            end: 'bottom top',
            scrub: 1,
          },
        })
      }

      if (floatCards.length > 0) {
        tl.fromTo(
          floatCards,
          { scale: 0.7, opacity: 0, y: 30 },
          {
            scale: 1,
            opacity: 1,
            y: 0,
            duration: 0.7,
            stagger: 0.06,
            ease: 'back.out(1.5)',
          },
          '-=0.4',
        )
      }

      ScrollTrigger.refresh()
    },
    { scope: heroRef, dependencies: [isMounted] },
  )

  return (
    <section
      ref={heroRef}
      id="hero"
      className="relative w-full overflow-hidden pt-10 pb-16 sm:pt-14 sm:pb-20 md:pt-18 md:pb-28"
    >
      <HeroGlowEffects />

      <div className="relative mx-auto flex w-full max-w-7xl flex-col items-center justify-start px-4 sm:px-6 md:px-8">
        <div className="flex w-full max-w-4xl flex-col items-center space-y-4 text-center sm:space-y-6">
          <div data-animate="hero-text">
            <Link
              href="/features"
              className="border-primary/30 bg-background/80 hover:bg-background hover:border-primary/50 text-foreground group inline-flex flex-wrap items-center justify-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold shadow-xs backdrop-blur-md transition-all duration-300 hover:scale-[1.02] sm:px-4 sm:py-1.5"
            >
              <span className="relative flex size-2">
                <span className="bg-primary absolute inline-flex size-full animate-ping rounded-full opacity-75" />
                <span className="bg-primary relative inline-flex size-2 rounded-full" />
              </span>
              <span className="bg-primary/15 text-primary shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold">
                {data.badgeNew}
              </span>
              <AnimatedShinyText className="text-foreground/90 group-hover:text-foreground text-[11px] sm:text-xs">
                {data.badgeText}
              </AnimatedShinyText>
              <ArrowRight className="text-muted-foreground group-hover:text-primary size-3.5 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </div>

          <h1
            data-animate="hero-text"
            className="text-foreground font-landing text-2xl font-extrabold tracking-tight text-balance sm:text-5xl md:text-6xl"
          >
            {data.titleStart} {data.titleGradient}
          </h1>

          <p
            data-animate="hero-text"
            className="text-muted-foreground mx-auto max-w-2xl text-xs leading-relaxed font-normal text-balance sm:text-base md:text-lg lg:text-xl"
          >
            {data.description}
          </p>
        </div>

        <div
          data-animate="hero-text"
          className="mt-6 flex w-full max-w-md flex-col items-stretch justify-center gap-2.5 sm:mt-8 sm:max-w-none sm:flex-row sm:items-center sm:gap-3"
        >
          <RainbowButton
            size="lg"
            asChild
            className="shadow-primary/20 h-10 w-full shadow-lg sm:h-12 sm:w-auto sm:px-8"
          >
            <Link
              href={
                isAuth ? getManageUrl('/merchant/dashboard') : REGISTER_HREF
              }
              className="flex items-center justify-center gap-2 text-xs font-bold sm:text-base"
            >
              <IconBuildingStore className="size-4 sm:size-5" />
              <span>{isAuth ? data.manageStoreBtn : data.registerBtn}</span>
              <IconArrowRight className="size-3.5 transition-transform group-hover:translate-x-1 sm:size-4" />
            </Link>
          </RainbowButton>

          <Button
            variant="outline"
            size="lg"
            asChild
            className="border-border/80 bg-background/70 hover:bg-muted/80 h-10 w-full cursor-pointer px-5 text-xs font-semibold backdrop-blur-md transition-all sm:h-12 sm:w-auto sm:px-7 sm:text-base"
          >
            <Link
              href="/download-pos"
              className="flex items-center justify-center gap-2"
            >
              <IconDeviceLaptop className="text-primary size-4 sm:size-5" />
              <span>{data.downloadPosBtn}</span>
            </Link>
          </Button>
        </div>

        <div
          data-animate="hero-text"
          className="mt-8 flex flex-wrap items-center justify-center gap-3 text-xs sm:gap-6 sm:text-sm"
        >
          <div className="flex items-center gap-2.5">
            <AvatarCluster />
            <div className="flex flex-col text-left">
              <div className="flex items-center gap-0.5 text-amber-500">
                {[...Array(5)].map((_, i) => (
                  <IconStarFilled key={i} size={11} className="sm:size-3" />
                ))}
              </div>
              <span className="text-muted-foreground text-[10px] font-medium sm:text-[11px]">
                {data.ratingText}
              </span>
            </div>
          </div>

          <div className="bg-border hidden h-3.5 w-px sm:block" />

          <div className="text-muted-foreground flex flex-wrap items-center justify-center gap-2.5 text-[11px] font-medium sm:gap-4 sm:text-xs">
            {data.trusts.map((trustText, i) => (
              <span
                key={i}
                className="text-foreground/90 flex items-center gap-1 font-semibold"
              >
                <IconCheck
                  size={13}
                  className="shrink-0 text-emerald-500"
                  strokeWidth={3}
                />
                {trustText}
              </span>
            ))}
          </div>
        </div>

        <div className="relative mx-auto mt-10 w-full max-w-5xl perspective-distant sm:mt-14 md:mt-18">
          <div
            aria-hidden="true"
            className="from-primary/20 pointer-events-none absolute -inset-3 -z-10 rounded-3xl bg-linear-to-r via-orange-500/10 to-amber-500/20 opacity-70 blur-3xl sm:-inset-6"
          />

          <div
            ref={mockupInnerRef}
            className="relative origin-top will-change-transform transform-3d"
          >
            <div className="bg-background/60 ring-border relative w-full overflow-hidden rounded-2xl border p-1.5 shadow-2xl ring-1 backdrop-blur-md sm:rounded-3xl sm:p-2.5">
              <Safari
                url="app.sitepow.store"
                className="w-full"
                videoSrc="/hero-section.mp4"
                deferVideo
              >
                <div className="size-full bg-neutral-200 dark:bg-neutral-800" />
              </Safari>
              <BorderBeam
                size={220}
                duration={8}
                colorFrom="#f97316"
                colorTo="#3b82f6"
                borderWidth={2}
              />
              <BorderBeam
                size={220}
                duration={8}
                delay={4}
                colorFrom="#10b981"
                colorTo="#f59e0b"
                borderWidth={2}
              />
            </div>

            <FloatingBadge
              position="top-left"
              className="animate-float-subtle"
              icon={<IconTrendingUp className="size-4 sm:size-5" />}
              iconBg="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
            >
              <span className="text-muted-foreground text-[10px] font-medium sm:text-xs">
                {data.floating.salesTitle}
              </span>
              <span className="text-foreground text-xs font-bold sm:text-sm">
                {data.floating.salesAmount}{' '}
                <span className="rounded-md bg-emerald-500/15 px-1 py-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                  {data.floating.salesGrowth}
                </span>
              </span>
            </FloatingBadge>

            <FloatingBadge
              position="top-right"
              className="animate-float-subtle [animation-delay:1.2s]"
              icon={<IconQrcode className="size-4 sm:size-5" />}
              iconBg="bg-blue-500/15 text-blue-600 dark:text-blue-400"
            >
              <div className="flex items-center gap-1.5">
                <span className="text-foreground text-xs font-bold sm:text-sm">
                  {data.floating.qrTitle}
                </span>
                <span className="relative flex size-1.5">
                  <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-500 opacity-75" />
                  <span className="relative inline-flex size-1.5 rounded-full bg-emerald-500" />
                </span>
              </div>
              <span className="text-muted-foreground text-[10px] font-medium sm:text-xs">
                {data.floating.qrDesc}
              </span>
            </FloatingBadge>

            <FloatingBadge
              position="mid-left"
              className="animate-float-subtle [animation-delay:2.4s] hover:border-amber-500/50"
              icon={<IconAlertTriangle className="size-4 sm:size-4.5" />}
              iconBg="bg-amber-500/15 text-amber-600 dark:text-amber-400"
            >
              <span className="text-foreground text-xs font-bold">
                {data.floating.stockTitle}
              </span>
              <span className="text-muted-foreground text-[10px] font-medium">
                {data.floating.stockDesc}
              </span>
            </FloatingBadge>

            <FloatingBadge
              position="mid-right"
              className="animate-float-subtle [animation-delay:0.8s] hover:border-indigo-500/50"
              icon={<IconWifiOff className="size-4 sm:size-4.5" />}
              iconBg="bg-indigo-500/15 text-indigo-600 dark:text-indigo-400"
            >
              <span className="text-foreground text-xs font-bold">
                {data.floating.offlineTitle}
              </span>
              <span className="text-muted-foreground text-[10px] font-medium">
                {data.floating.offlineDesc}
              </span>
            </FloatingBadge>

            <FloatingBadge
              position="bottom-left"
              className="animate-float-subtle [animation-delay:1.8s]"
              icon={<IconBolt className="size-4 sm:size-5" />}
              iconBg="bg-violet-500/15 text-violet-600 dark:text-violet-400"
            >
              <span className="text-foreground text-xs font-bold sm:text-sm">
                {data.floating.speedTitle}
              </span>
              <span className="text-muted-foreground text-[10px] font-medium sm:text-xs">
                {data.floating.speedDesc}
              </span>
            </FloatingBadge>

            <FloatingBadge
              position="bottom-right"
              className="animate-float-subtle [animation-delay:2.8s] hover:border-orange-500/50"
              icon={<IconReceipt2 className="size-4 sm:size-5" />}
              iconBg="bg-orange-500/15 text-orange-600 dark:text-orange-400"
            >
              <div className="flex items-center gap-1.5">
                <span className="text-foreground text-xs font-bold sm:text-sm">
                  {data.floating.orderTitle}
                </span>
                <span className="size-1.5 rounded-full bg-orange-500" />
              </div>
              <span className="text-muted-foreground text-[10px] font-medium sm:text-xs">
                {data.floating.orderDesc}
              </span>
            </FloatingBadge>

            <div
              data-animate="float-card"
              className="border-primary/30 bg-background/95 shadow-primary/10 hover:border-primary/60 absolute -bottom-3.5 left-1/2 z-20 hidden -translate-x-1/2 cursor-default items-center gap-2 rounded-full border px-3.5 py-1.5 shadow-xl transition-all sm:flex"
            >
              <span className="relative flex size-2">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-500 opacity-75" />
                <span className="relative inline-flex size-2 rounded-full bg-emerald-500" />
              </span>
              <span className="text-foreground text-[11px] font-semibold">
                {data.floating.cloudSyncText}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function HeroGlowEffects() {
  return (
    <>
      <div
        aria-hidden="true"
        className="from-primary/25 pointer-events-none absolute -top-24 left-1/2 -z-10 h-137.5 w-237.5 -translate-x-1/2 rounded-full bg-radial via-orange-500/10 to-transparent blur-[130px]"
      />
      <AnimatedGridPattern
        numSquares={24}
        maxOpacity={0.35}
        duration={3}
        className="-z-10 mask-[radial-gradient(450px_circle_at_center,white,transparent)] opacity-60 sm:mask-[radial-gradient(850px_circle_at_center,white,transparent)] dark:opacity-30"
      />
    </>
  )
}

function AvatarCluster() {
  return (
    <div className="flex -space-x-2">
      <span className="ring-background inline-flex size-6 items-center justify-center rounded-full bg-linear-to-tr from-orange-500 to-amber-400 text-[10px] font-bold text-white ring-2 sm:size-7">
        SP
      </span>
      <span className="ring-background inline-flex size-6 items-center justify-center rounded-full bg-linear-to-tr from-blue-600 to-indigo-400 text-[10px] font-bold text-white ring-2 sm:size-7">
        KT
      </span>
      <span className="ring-background inline-flex size-6 items-center justify-center rounded-full bg-linear-to-tr from-emerald-500 to-teal-400 text-[10px] font-bold text-white ring-2 sm:size-7">
        MR
      </span>
      <span className="ring-background inline-flex size-6 items-center justify-center rounded-full bg-linear-to-tr from-rose-500 to-pink-400 text-[10px] font-bold text-white ring-2 sm:size-7">
        NT
      </span>
    </div>
  )
}

function FloatingBadge({
  position,
  icon,
  iconBg,
  className,
  children,
}: {
  position:
    | 'top-left'
    | 'top-right'
    | 'mid-left'
    | 'mid-right'
    | 'bottom-left'
    | 'bottom-right'
  icon: React.ReactNode
  iconBg: string
  className?: string
  children: React.ReactNode
}) {
  const positionClasses = {
    'top-left': '-top-5 -left-3 sm:-top-8 sm:-left-8 sm:gap-3.5 sm:p-3.5',
    'top-right': '-top-5 -right-3 sm:-top-8 sm:-right-8 sm:gap-3 sm:p-3.5',
    'mid-left':
      'top-1/2 -left-4 hidden -translate-y-1/2 md:-left-12 md:flex lg:-left-14',
    'mid-right':
      'top-1/2 -right-4 hidden -translate-y-1/2 md:-right-12 md:flex lg:-right-14',
    'bottom-left':
      '-bottom-5 -left-3 hidden sm:-bottom-8 sm:-left-8 sm:flex sm:gap-3 sm:p-3.5',
    'bottom-right':
      '-right-3 -bottom-5 sm:-right-8 sm:-bottom-8 sm:gap-3 sm:p-3.5',
  }

  return (
    <div
      data-animate="float-card"
      className={cn(
        'border-border/70 bg-background/95 shadow-primary/5 group absolute z-20 flex cursor-default items-center gap-2.5 rounded-2xl border p-2.5 shadow-xl transition-all duration-300',
        positionClasses[position],
        className,
      )}
    >
      <div
        className={cn(
          'flex size-8 shrink-0 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-110 sm:size-10',
          iconBg,
        )}
      >
        {icon}
      </div>
      <div className="flex flex-col pr-1 text-left">{children}</div>
    </div>
  )
}
