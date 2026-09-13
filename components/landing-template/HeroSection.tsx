'use client'
import { useRef } from 'react'

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
  // Floating Widgets Props (Optional Overrides)
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

export function HeroSection({
  badgeNew,
  badgeText,
  titleStart,
  titleGradient,
  description,
  registerBtn,
  manageStoreBtn,
  downloadPosBtn,
  ratingText,
  trust1,
  trust2,
  trust3,
  trust4,
  floatSalesTitle,
  floatSalesAmount,
  floatSalesGrowth,
  floatQrTitle,
  floatQrDesc,
  floatStockTitle,
  floatStockDesc,
  floatOfflineTitle,
  floatOfflineDesc,
  floatSpeedTitle,
  floatSpeedDesc,
  floatOrderTitle,
  floatOrderDesc,
  floatCloudSyncText,
}: HeroSectionProps = {}) {
  const isMounted = useIsMounted()
  const t = useTranslations('home.hero')
  const { isAuthenticated } = useSession()
  const isAuth = isMounted && isAuthenticated
  const registerParams = new URLSearchParams()
  registerParams.set('role', UserRole.MERCHANT)
  registerParams.set('callbackUrl', '/merchant/dashboard')
  const registerHref = `/register?${registerParams.toString()}`

  // Hero Texts
  const resolvedBadgeNew = badgeNew ?? t('badgeNew')
  const resolvedBadgeText = badgeText ?? t('badgeText', { gp: 0 })
  const resolvedTitleStart = titleStart ?? t('titleStart')
  const resolvedTitleGradient = titleGradient ?? t('titleGradient')
  const resolvedDescription = description ?? t('description')
  const resolvedRegisterBtn = registerBtn ?? t('registerBtn')
  const resolvedManageStoreBtn = manageStoreBtn ?? t('manageStoreBtn')
  const resolvedDownloadPosBtn = downloadPosBtn ?? t('downloadPosBtn')
  const resolvedRatingText =
    ratingText ?? t('ratingText', { rating: '4.9', merchants: '1,200' })
  const resolvedTrust1 = trust1 ?? t('trust1', { gp: 0 })
  const resolvedTrust2 = trust2 ?? t('trust2')
  const resolvedTrust3 = trust3 ?? t('trust3', { minutes: 3 })
  const resolvedTrust4 = trust4 ?? t('trust4')

  // Floating Widgets Translations (มี default interpolation ให้พร้อม)
  const resolvedFloatSalesTitle =
    floatSalesTitle ?? t('floating.salesTodayTitle')
  const resolvedFloatSalesAmount =
    floatSalesAmount ?? t('floating.salesTodayAmount', { amount: '24,850' })
  const resolvedFloatSalesGrowth =
    floatSalesGrowth ?? t('floating.salesTodayGrowth', { rate: '32.4' })
  const resolvedFloatQrTitle = floatQrTitle ?? t('floating.qrTitle')
  const resolvedFloatQrDesc = floatQrDesc ?? t('floating.qrDesc', { gpRate: 0 })
  const resolvedFloatStockTitle = floatStockTitle ?? t('floating.stockTitle')
  const resolvedFloatStockDesc =
    floatStockDesc ?? t('floating.stockDesc', { item: 'House Blend', count: 3 })
  const resolvedFloatOfflineTitle =
    floatOfflineTitle ?? t('floating.offlineTitle')
  const resolvedFloatOfflineDesc = floatOfflineDesc ?? t('floating.offlineDesc')
  const resolvedFloatSpeedTitle =
    floatSpeedTitle ?? t('floating.speedTitle', { time: '0.2' })
  const resolvedFloatSpeedDesc = floatSpeedDesc ?? t('floating.speedDesc')
  const resolvedFloatOrderTitle =
    floatOrderTitle ?? t('floating.orderTitle', { orderNo: 'A-128' })
  const resolvedFloatOrderDesc = floatOrderDesc ?? t('floating.orderDesc')
  const resolvedFloatCloudSyncText =
    floatCloudSyncText ?? t('floating.cloudSyncText')

  const heroRef = useRef<HTMLElement>(null)
  const badgeRef = useRef<HTMLDivElement>(null)
  const titleRef = useRef<HTMLHeadingElement>(null)
  const descRef = useRef<HTMLParagraphElement>(null)
  const ctaRef = useRef<HTMLDivElement>(null)
  const trustRef = useRef<HTMLDivElement>(null)
  const mockupWrapperRef = useRef<HTMLDivElement>(null)
  const mockupInnerRef = useRef<HTMLDivElement>(null)

  // Floating Elements Refs
  const floatTopLeftRef = useRef<HTMLDivElement>(null)
  const floatTopRightRef = useRef<HTMLDivElement>(null)
  const floatMidLeftRef = useRef<HTMLDivElement>(null)
  const floatMidRightRef = useRef<HTMLDivElement>(null)
  const floatBottomLeftRef = useRef<HTMLDivElement>(null)
  const floatBottomRightRef = useRef<HTMLDivElement>(null)
  const floatCenterBottomRef = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      if (!isMounted) return
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })

      if (badgeRef.current) {
        tl.fromTo(
          badgeRef.current,
          { y: -25, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.7 },
        )
      }
      if (titleRef.current) {
        tl.fromTo(
          titleRef.current,
          { y: 35, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.8 },
          '-=0.4',
        )
      }
      if (descRef.current) {
        tl.fromTo(
          descRef.current,
          { y: 25, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.7 },
          '-=0.5',
        )
      }
      if (ctaRef.current) {
        tl.fromTo(
          ctaRef.current,
          { y: 20, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.6 },
          '-=0.4',
        )
      }
      if (trustRef.current) {
        tl.fromTo(
          trustRef.current,
          { y: 15, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.6 },
          '-=0.3',
        )
      }

      if (mockupInnerRef.current) {
        tl.fromTo(
          mockupInnerRef.current,
          { rotateX: 18, y: 0, scale: 0.9, opacity: 0 },
          {
            rotateX: 6,
            y: 0,
            scale: 1,
            opacity: 1,
            duration: 1.1,
            ease: 'power2.out',
          },
          '-=0.4',
        )

        gsap.to(mockupInnerRef.current, {
          rotateX: 0,
          y: -40,
          ease: 'none',
          scrollTrigger: {
            trigger: heroRef.current,
            start: 'top top',
            end: 'bottom top',
            scrub: 1,
          },
        })
      }

      // Entrance animation สำหรับ floating badges
      const allFloatingElements = [
        floatTopLeftRef.current,
        floatTopRightRef.current,
        floatMidLeftRef.current,
        floatMidRightRef.current,
        floatBottomLeftRef.current,
        floatBottomRightRef.current,
        floatCenterBottomRef.current,
      ].filter(Boolean)

      if (allFloatingElements.length > 0) {
        tl.fromTo(
          allFloatingElements,
          { scale: 0.5, opacity: 0, y: 40 },
          {
            scale: 1,
            opacity: 1,
            y: 0,
            duration: 0.85,
            stagger: 0.08,
            ease: 'back.out(1.8)',
          },
          '-=0.5',
        )
      }

      // Floating loop
      const floatConfigs = [
        { ref: floatTopLeftRef.current, y: -13, rot: -2, dur: 3.2, delay: 0 },
        {
          ref: floatTopRightRef.current,
          y: 12,
          rot: 2.5,
          dur: 3.8,
          delay: 0.3,
        },
        { ref: floatMidLeftRef.current, y: -9, rot: 1.5, dur: 2.9, delay: 0.6 },
        { ref: floatMidRightRef.current, y: 11, rot: -2, dur: 3.5, delay: 0.2 },
        {
          ref: floatBottomLeftRef.current,
          y: 10,
          rot: -1.8,
          dur: 3.4,
          delay: 0.5,
        },
        {
          ref: floatBottomRightRef.current,
          y: -12,
          rot: 2,
          dur: 3.1,
          delay: 0.1,
        },
        {
          ref: floatCenterBottomRef.current,
          y: -7,
          rot: 0,
          dur: 2.6,
          delay: 0.4,
        },
      ]

      floatConfigs.forEach(({ ref, y, rot, dur, delay }) => {
        if (!ref) return
        gsap.to(ref, {
          y,
          rotate: rot,
          duration: dur,
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut',
          delay,
        })
      })

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
      <div
        aria-hidden="true"
        className="from-primary/30 dark:from-primary/25 pointer-events-none absolute -top-24 left-1/2 -z-10 h-137.5 w-237.5 -translate-x-1/2 rounded-full bg-radial via-orange-500/15 to-transparent blur-[130px] dark:via-orange-500/10"
      />
      <div
        aria-hidden="true"
        className="via-primary/5 pointer-events-none absolute top-48 -left-32 -z-10 size-80 rounded-full bg-radial from-indigo-500/10 to-transparent blur-[100px]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-60 -right-32 -z-10 size-80 rounded-full bg-radial from-amber-500/10 via-orange-500/5 to-transparent blur-[100px]"
      />
      <AnimatedGridPattern
        numSquares={32}
        maxOpacity={0.4}
        duration={3}
        className="-z-10 mask-[radial-gradient(450px_circle_at_center,white,transparent)] opacity-75 sm:mask-[radial-gradient(850px_circle_at_center,white,transparent)] dark:opacity-40"
      />
      <div className="relative mx-auto flex w-full max-w-7xl flex-col items-center justify-start px-4 sm:px-6 md:px-8">
        {/* Header Content */}
        <div className="flex w-full max-w-4xl flex-col items-center space-y-4 text-center sm:space-y-6">
          <div ref={badgeRef}>
            <Link
              href="/features"
              className="group border-primary/30 bg-background/80 hover:bg-background hover:border-primary/50 text-foreground inline-flex flex-wrap items-center justify-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold shadow-xs backdrop-blur-xl transition-all duration-300 hover:scale-[1.02] sm:px-4 sm:py-1.5"
            >
              <span className="relative flex size-2">
                <span className="bg-primary absolute inline-flex size-full animate-ping rounded-full opacity-75" />
                <span className="bg-primary relative inline-flex size-2 rounded-full" />
              </span>
              <span className="bg-primary/15 text-primary dark:text-primary shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold">
                {resolvedBadgeNew}
              </span>
              <AnimatedShinyText className="text-foreground/90 group-hover:text-foreground text-[11px] sm:text-xs">
                {resolvedBadgeText}
              </AnimatedShinyText>
              <ArrowRight className="text-muted-foreground group-hover:text-primary size-3.5 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </div>
          <h1
            ref={titleRef}
            className="text-foreground text-2xl font-extrabold tracking-tight text-balance sm:text-5xl md:text-6xl"
          >
            {resolvedTitleStart} {resolvedTitleGradient}
          </h1>
          <p
            ref={descRef}
            className="text-muted-foreground mx-auto max-w-2xl text-xs leading-relaxed font-normal text-balance sm:text-base md:text-lg lg:text-xl"
          >
            {resolvedDescription}
          </p>
        </div>

        {/* CTA Buttons */}
        <div
          ref={ctaRef}
          className="mt-6 flex w-full max-w-md flex-col items-stretch justify-center gap-2.5 sm:mt-8 sm:max-w-none sm:flex-row sm:items-center sm:gap-3"
        >
          {!isAuth ? (
            <RainbowButton
              size="lg"
              asChild
              className="shadow-primary/20 h-10 w-full shadow-lg sm:h-12 sm:w-auto sm:px-8"
            >
              <Link
                href={registerHref}
                className="flex items-center justify-center gap-2 text-xs font-bold sm:text-base"
              >
                <IconBuildingStore className="size-4 sm:size-5" />
                <span>{resolvedRegisterBtn}</span>
                <IconArrowRight className="size-3.5 transition-transform group-hover:translate-x-1 sm:size-4" />
              </Link>
            </RainbowButton>
          ) : (
            <RainbowButton
              size="lg"
              asChild
              className="shadow-primary/20 h-10 w-full shadow-lg sm:h-12 sm:w-auto sm:px-8"
            >
              <a
                href={getManageUrl('/merchant/dashboard')}
                className="flex items-center justify-center gap-2 text-xs font-bold sm:text-base"
              >
                <IconBuildingStore className="size-4 sm:size-5" />
                <span>{resolvedManageStoreBtn}</span>
                <IconArrowRight className="size-3.5 transition-transform group-hover:translate-x-1 sm:size-4" />
              </a>
            </RainbowButton>
          )}
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
              <span>{resolvedDownloadPosBtn}</span>
            </Link>
          </Button>
        </div>

        {/* Social Proof */}
        <div
          ref={trustRef}
          className="mt-8 flex flex-wrap items-center justify-center gap-3 text-xs sm:gap-6 sm:text-sm"
        >
          <div className="flex items-center gap-2.5">
            <div className="flex -space-x-2">
              <span className="ring-background inline-flex size-6 items-center justify-center rounded-full bg-linear-to-tr from-orange-500 to-amber-400 text-[10px] font-bold text-white shadow-xs ring-2 sm:size-7">
                SP
              </span>
              <span className="ring-background inline-flex size-6 items-center justify-center rounded-full bg-linear-to-tr from-blue-600 to-indigo-400 text-[10px] font-bold text-white shadow-xs ring-2 sm:size-7">
                KT
              </span>
              <span className="ring-background inline-flex size-6 items-center justify-center rounded-full bg-linear-to-tr from-emerald-500 to-teal-400 text-[10px] font-bold text-white shadow-xs ring-2 sm:size-7">
                MR
              </span>
              <span className="ring-background inline-flex size-6 items-center justify-center rounded-full bg-linear-to-tr from-rose-500 to-pink-400 text-[10px] font-bold text-white shadow-xs ring-2 sm:size-7">
                NT
              </span>
            </div>
            <div className="flex flex-col text-left">
              <div className="flex items-center gap-0.5 text-amber-500">
                {[...Array(5)].map((_, i) => (
                  <IconStarFilled key={i} size={11} className="sm:size-3" />
                ))}
              </div>
              <span className="text-muted-foreground text-[10px] font-medium sm:text-[11px]">
                {resolvedRatingText}
              </span>
            </div>
          </div>
          <div className="bg-border hidden h-3.5 w-px sm:block" />
          <div className="text-muted-foreground flex flex-wrap items-center justify-center gap-2.5 text-[11px] font-medium sm:gap-4 sm:text-xs">
            <span className="text-foreground/90 flex items-center gap-1 font-semibold">
              <IconCheck
                size={13}
                className="shrink-0 text-emerald-500"
                strokeWidth={3}
              />
              {resolvedTrust1}
            </span>
            <span className="text-foreground/90 flex items-center gap-1 font-semibold">
              <IconCheck
                size={13}
                className="shrink-0 text-emerald-500"
                strokeWidth={3}
              />
              {resolvedTrust2}
            </span>
            <span className="text-foreground/90 flex items-center gap-1 font-semibold">
              <IconCheck
                size={13}
                className="shrink-0 text-emerald-500"
                strokeWidth={3}
              />
              {resolvedTrust3}
            </span>
            {resolvedTrust4 && (
              <span className="text-foreground/90 flex items-center gap-1 font-semibold">
                <IconCheck
                  size={13}
                  className="shrink-0 text-emerald-500"
                  strokeWidth={3}
                />
                {resolvedTrust4}
              </span>
            )}
          </div>
        </div>

        {/* Mockup Showcase + 7 Floating Widgets */}
        <div
          ref={mockupWrapperRef}
          className="relative mx-auto mt-10 w-full max-w-5xl perspective-distant sm:mt-14 md:mt-18"
        >
          <div
            aria-hidden="true"
            className="from-primary/30 pointer-events-none absolute -inset-3 -z-10 rounded-3xl bg-linear-to-r via-orange-500/20 to-amber-500/30 opacity-70 blur-3xl transition-opacity sm:-inset-6 dark:opacity-45"
          />
          <div
            ref={mockupInnerRef}
            className="relative origin-top transform-3d"
          >
            <div className="bg-background/60 ring-border relative w-full overflow-hidden rounded-2xl border p-1.5 shadow-2xl ring-1 backdrop-blur-xl sm:rounded-3xl sm:p-2.5">
              <Safari
                url="app.sitepow.store"
                className="w-full"
                videoSrc="/hero-section.mp4"
                deferVideo={true}
              >
                <div className="size-full bg-neutral-200 dark:bg-neutral-800" />
              </Safari>
              <BorderBeam
                size={220}
                duration={7}
                colorFrom="#f97316"
                colorTo="#3b82f6"
                borderWidth={2}
              />
              <BorderBeam
                size={220}
                duration={7}
                delay={3.5}
                colorFrom="#10b981"
                colorTo="#f59e0b"
                borderWidth={2}
              />
            </div>

            {/* ==================== 1. TOP-LEFT: ยอดขาย & เติบโต ==================== */}
            <div
              ref={floatTopLeftRef}
              className="border-border/70 bg-background/90 shadow-primary/10 hover:border-primary/50 group absolute -top-5 -left-3 z-20 flex cursor-default items-center gap-2.5 rounded-2xl border p-2.5 shadow-2xl backdrop-blur-xl transition-all duration-300 sm:-top-8 sm:-left-8 sm:gap-3.5 sm:p-3.5"
            >
              <div className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-600 transition-transform duration-300 group-hover:scale-110 sm:size-10 dark:text-emerald-400">
                <IconTrendingUp className="size-4 sm:size-5" />
              </div>
              <div className="flex flex-col pr-1 text-left">
                <span className="text-muted-foreground text-[10px] font-medium sm:text-xs">
                  {resolvedFloatSalesTitle}
                </span>
                <span className="text-foreground text-xs font-bold sm:text-sm">
                  {resolvedFloatSalesAmount}{' '}
                  <span className="rounded-md bg-emerald-500/15 px-1 py-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                    {resolvedFloatSalesGrowth}
                  </span>
                </span>
              </div>
            </div>

            {/* ==================== 2. TOP-RIGHT: QR สแกนจ่ายไว ==================== */}
            <div
              ref={floatTopRightRef}
              className="border-border/70 bg-background/90 shadow-primary/10 hover:border-primary/50 group absolute -top-5 -right-3 z-20 flex cursor-default items-center gap-2.5 rounded-2xl border p-2.5 shadow-2xl backdrop-blur-xl transition-all duration-300 sm:-top-8 sm:-right-8 sm:gap-3 sm:p-3.5"
            >
              <div className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-blue-500/15 text-blue-600 transition-transform duration-300 group-hover:scale-110 sm:size-10 dark:text-blue-400">
                <IconQrcode className="size-4 sm:size-5" />
              </div>
              <div className="flex flex-col pr-1 text-left">
                <div className="flex items-center gap-1.5">
                  <span className="text-foreground text-xs font-bold sm:text-sm">
                    {resolvedFloatQrTitle}
                  </span>
                  <span className="relative flex size-1.5">
                    <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-500 opacity-75" />
                    <span className="relative inline-flex size-1.5 rounded-full bg-emerald-500" />
                  </span>
                </div>
                <span className="text-muted-foreground text-[10px] font-medium sm:text-xs">
                  {resolvedFloatQrDesc}
                </span>
              </div>
            </div>

            {/* ==================== 3. MID-LEFT: แจ้งเตือนสต็อก ==================== */}
            <div
              ref={floatMidLeftRef}
              className="border-border/70 bg-background/90 shadow-primary/10 group absolute top-1/2 -left-4 z-20 hidden -translate-y-1/2 cursor-default items-center gap-2.5 rounded-2xl border p-2.5 shadow-2xl backdrop-blur-xl transition-all duration-300 hover:border-amber-500/50 md:-left-12 md:flex lg:-left-14"
            >
              <div className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-amber-500/15 text-amber-600 transition-transform duration-300 group-hover:scale-110 sm:size-9 dark:text-amber-400">
                <IconAlertTriangle className="size-4 sm:size-4.5" />
              </div>
              <div className="flex flex-col pr-1 text-left">
                <span className="text-foreground text-xs font-bold">
                  {resolvedFloatStockTitle}
                </span>
                <span className="text-muted-foreground text-[10px] font-medium">
                  {resolvedFloatStockDesc}
                </span>
              </div>
            </div>

            {/* ==================== 4. MID-RIGHT: รองรับ Offline Mode ==================== */}
            <div
              ref={floatMidRightRef}
              className="border-border/70 bg-background/90 shadow-primary/10 group absolute top-1/2 -right-4 z-20 hidden -translate-y-1/2 cursor-default items-center gap-2.5 rounded-2xl border p-2.5 shadow-2xl backdrop-blur-xl transition-all duration-300 hover:border-indigo-500/50 md:-right-12 md:flex lg:-right-14"
            >
              <div className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-indigo-500/15 text-indigo-600 transition-transform duration-300 group-hover:scale-110 sm:size-9 dark:text-indigo-400">
                <IconWifiOff className="size-4 sm:size-4.5" />
              </div>
              <div className="flex flex-col pr-1 text-left">
                <div className="flex items-center gap-1">
                  <span className="text-foreground text-xs font-bold">
                    {resolvedFloatOfflineTitle}
                  </span>
                </div>
                <span className="text-muted-foreground text-[10px] font-medium">
                  {resolvedFloatOfflineDesc}
                </span>
              </div>
            </div>

            {/* ==================== 5. BOTTOM-LEFT: POS Speed ==================== */}
            <div
              ref={floatBottomLeftRef}
              className="border-border/70 bg-background/90 shadow-primary/10 hover:border-primary/50 group absolute -bottom-5 -left-3 z-20 hidden cursor-default items-center gap-2.5 rounded-2xl border p-2.5 shadow-2xl backdrop-blur-xl transition-all duration-300 sm:-bottom-8 sm:-left-8 sm:flex sm:gap-3 sm:p-3.5"
            >
              <div className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-violet-500/15 text-violet-600 transition-transform duration-300 group-hover:scale-110 sm:size-10 dark:text-violet-400">
                <IconBolt className="size-4 sm:size-5" />
              </div>
              <div className="flex flex-col pr-1 text-left">
                <span className="text-foreground text-xs font-bold sm:text-sm">
                  {resolvedFloatSpeedTitle}
                </span>
                <span className="text-muted-foreground text-[10px] font-medium sm:text-xs">
                  {resolvedFloatSpeedDesc}
                </span>
              </div>
            </div>

            {/* ==================== 6. BOTTOM-RIGHT: ออเดอร์ล่าสุด ==================== */}
            <div
              ref={floatBottomRightRef}
              className="border-border/70 bg-background/90 shadow-primary/10 group absolute -right-3 -bottom-5 z-20 flex cursor-default items-center gap-2.5 rounded-2xl border p-2.5 shadow-2xl backdrop-blur-xl transition-all duration-300 hover:border-orange-500/50 sm:-right-8 sm:-bottom-8 sm:gap-3 sm:p-3.5"
            >
              <div className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-orange-500/15 text-orange-600 transition-transform duration-300 group-hover:scale-110 sm:size-10 dark:text-orange-400">
                <IconReceipt2 className="size-4 sm:size-5" />
              </div>
              <div className="flex flex-col pr-1 text-left">
                <div className="flex items-center gap-1.5">
                  <span className="text-foreground text-xs font-bold sm:text-sm">
                    {resolvedFloatOrderTitle}
                  </span>
                  <span className="size-1.5 rounded-full bg-orange-500" />
                </div>
                <span className="text-muted-foreground text-[10px] font-medium sm:text-xs">
                  {resolvedFloatOrderDesc}
                </span>
              </div>
            </div>

            {/* ==================== 7. BOTTOM-CENTER: Cloud Sync Pill ==================== */}
            <div
              ref={floatCenterBottomRef}
              className="border-primary/30 bg-background/95 shadow-primary/10 hover:border-primary/60 absolute -bottom-3.5 left-1/2 z-20 hidden -translate-x-1/2 cursor-default items-center gap-2 rounded-full border px-3.5 py-1.5 shadow-xl backdrop-blur-md transition-all sm:flex"
            >
              <span className="relative flex size-2">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-500 opacity-75" />
                <span className="relative inline-flex size-2 rounded-full bg-emerald-500" />
              </span>
              <span className="text-foreground text-[11px] font-semibold">
                {resolvedFloatCloudSyncText}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
