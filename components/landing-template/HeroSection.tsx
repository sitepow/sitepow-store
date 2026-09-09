'use client'
import { useRef } from 'react'

import { useTranslations } from 'next-intl'
import Link from 'next/link'

import { UserRole } from '@/generated/prisma/enums'
import { useIsMounted } from '@/hooks/use-is-mounted'
import { useSession } from '@/hooks/use-session'
import {
  IconArrowRight,
  IconBuildingStore,
  IconChartBar,
  IconCheck,
  IconDeviceLaptop,
  IconReceipt,
  IconSparkles,
  IconStarFilled,
} from '@tabler/icons-react'
import { ArrowRight } from 'lucide-react'

import { AnimatedGridPattern } from '@/components/magicui/animated-grid-pattern'
import { AnimatedShinyText } from '@/components/magicui/animated-shiny-text'
import { BorderBeam } from '@/components/magicui/border-beam'
import { RainbowButton } from '@/components/magicui/rainbow-button'
import { Safari } from '@/components/magicui/safari'
import { Button } from '@/components/ui/button'

import { ScrollTrigger, gsap, useGSAP } from '@/lib/gsap'

export function HeroSection() {
  const isMounted = useIsMounted()
  const t = useTranslations('home.hero')
  const { isAuthenticated } = useSession()
  const isAuth = isMounted && isAuthenticated
  const registerParams = new URLSearchParams()
  registerParams.set('role', UserRole.MERCHANT)
  registerParams.set('callbackUrl', '/merchant/dashboard')
  const registerHref = `/register?${registerParams.toString()}`

  const heroRef = useRef<HTMLElement>(null)
  const badgeRef = useRef<HTMLDivElement>(null)
  const titleRef = useRef<HTMLHeadingElement>(null)
  const descRef = useRef<HTMLParagraphElement>(null)
  const ctaRef = useRef<HTMLDivElement>(null)
  const trustRef = useRef<HTMLDivElement>(null)
  const mockupWrapperRef = useRef<HTMLDivElement>(null)
  const mockupInnerRef = useRef<HTMLDivElement>(null)
  const widget1Ref = useRef<HTMLDivElement>(null)
  const widget2Ref = useRef<HTMLDivElement>(null)
  const widget3Ref = useRef<HTMLDivElement>(null)

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
          { rotateX: 18, y: 75, scale: 0.9, opacity: 0 },
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

        // 3D Perspective leveling on scroll (Apple / Linear style)
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

      // Floating live status badges entrance
      const widgets = [
        widget1Ref.current,
        widget2Ref.current,
        widget3Ref.current,
      ].filter(Boolean)

      if (widgets.length > 0) {
        tl.fromTo(
          widgets,
          { scale: 0.75, opacity: 0, y: 25 },
          {
            scale: 1,
            opacity: 1,
            y: 0,
            stagger: 0.12,
            duration: 0.6,
            ease: 'back.out(1.7)',
          },
          '-=0.4',
        )

        // Continuous subtle floating / breathing animation with out-of-phase offsets
        if (widget1Ref.current) {
          gsap.to(widget1Ref.current, {
            y: -7,
            duration: 2.6,
            repeat: -1,
            yoyo: true,
            ease: 'sine.inOut',
          })
        }
        if (widget2Ref.current) {
          gsap.to(widget2Ref.current, {
            y: -9,
            duration: 3.1,
            repeat: -1,
            yoyo: true,
            ease: 'sine.inOut',
            delay: 0.4,
          })
        }
        if (widget3Ref.current) {
          gsap.to(widget3Ref.current, {
            y: -6,
            duration: 2.8,
            repeat: -1,
            yoyo: true,
            ease: 'sine.inOut',
            delay: 0.8,
          })
        }
      }

      ScrollTrigger.refresh()
    },
    { scope: heroRef, dependencies: [isMounted] },
  )

  return (
    <section
      ref={heroRef}
      id="hero"
      className="relative w-full overflow-hidden pt-10 pb-12 sm:pt-14 sm:pb-16 md:pt-18 md:pb-20"
    >
      {/* World-class Ambient Lighting Mesh */}
      <div
        aria-hidden="true"
        className="from-primary/30 dark:from-primary/25 pointer-events-none absolute -top-24 left-1/2 -z-10 h-[550px] w-[950px] -translate-x-1/2 rounded-full bg-radial via-orange-500/15 to-transparent blur-[130px] dark:via-orange-500/10"
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
        className="-z-10 [mask-image:radial-gradient(450px_circle_at_center,white,transparent)] opacity-75 sm:[mask-image:radial-gradient(850px_circle_at_center,white,transparent)] dark:opacity-40"
      />

      <div className="relative mx-auto flex w-full max-w-7xl flex-col items-center justify-start px-4 sm:px-6 md:px-8">
        {/* Header Content */}
        <div className="flex w-full max-w-4xl flex-col items-center space-y-4 text-center sm:space-y-6">
          {/* Announcement Pill */}
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
                {t('badgeNew')}
              </span>
              <AnimatedShinyText className="text-foreground/90 group-hover:text-foreground text-[11px] sm:text-xs">
                {t('badgeText', { gp: 0 })}
              </AnimatedShinyText>
              <ArrowRight className="text-muted-foreground group-hover:text-primary size-3.5 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </div>

          {/* Main Headline */}
          <h1
            ref={titleRef}
            className="text-foreground text-2xl font-extrabold tracking-tight text-balance sm:text-5xl md:text-6xl"
          >
            {t('titleStart')}{' '}
            <span className="from-primary bg-linear-to-r via-orange-500 to-amber-500 bg-clip-text text-transparent drop-shadow-xs">
              {t('titleGradient')}
            </span>
          </h1>

          {/* Subtitle */}
          <p
            ref={descRef}
            className="text-muted-foreground mx-auto max-w-2xl text-xs leading-relaxed font-normal text-balance sm:text-base md:text-lg lg:text-xl"
          >
            {t('description')}
          </p>
        </div>

        {/* CTA Actions */}
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
                <span>{t('registerBtn')}</span>
                <IconArrowRight className="size-3.5 transition-transform group-hover:translate-x-1 sm:size-4" />
              </Link>
            </RainbowButton>
          ) : (
            <RainbowButton
              size="lg"
              asChild
              className="shadow-primary/20 h-10 w-full shadow-lg sm:h-12 sm:w-auto sm:px-8"
            >
              <Link
                href="/merchant/dashboard"
                className="flex items-center justify-center gap-2 text-xs font-bold sm:text-base"
              >
                <IconBuildingStore className="size-4 sm:size-5" />
                <span>{t('manageStoreBtn')}</span>
                <IconArrowRight className="size-3.5 transition-transform group-hover:translate-x-1 sm:size-4" />
              </Link>
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
              <span>{t('downloadPosBtn')}</span>
            </Link>
          </Button>
        </div>

        {/* Trust & Social Proof Strip */}
        <div
          ref={trustRef}
          className="mt-6 flex flex-wrap items-center justify-center gap-3 text-xs sm:mt-8 sm:gap-6 sm:text-sm"
        >
          {/* Merchant Avatar Stack & Rating */}
          <div className="flex items-center gap-2.5">
            <div className="flex -space-x-2">
              <span className="ring-background inline-flex size-6 items-center justify-center rounded-full bg-gradient-to-tr from-orange-500 to-amber-400 text-[10px] font-bold text-white shadow-xs ring-2 sm:size-7">
                SP
              </span>
              <span className="ring-background inline-flex size-6 items-center justify-center rounded-full bg-gradient-to-tr from-blue-600 to-indigo-400 text-[10px] font-bold text-white shadow-xs ring-2 sm:size-7">
                KT
              </span>
              <span className="ring-background inline-flex size-6 items-center justify-center rounded-full bg-gradient-to-tr from-emerald-500 to-teal-400 text-[10px] font-bold text-white shadow-xs ring-2 sm:size-7">
                MR
              </span>
              <span className="ring-background inline-flex size-6 items-center justify-center rounded-full bg-gradient-to-tr from-rose-500 to-pink-400 text-[10px] font-bold text-white shadow-xs ring-2 sm:size-7">
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
                {t('ratingText', { rating: '4.9', merchants: '1,200' })}
              </span>
            </div>
          </div>

          <div className="bg-border hidden h-3.5 w-px sm:block" />

          {/* Trust Value Props */}
          <div className="text-muted-foreground flex flex-wrap items-center justify-center gap-2.5 text-[11px] font-medium sm:gap-4 sm:text-xs">
            <span className="text-foreground/90 flex items-center gap-1 font-semibold">
              <IconCheck
                size={13}
                className="shrink-0 text-emerald-500"
                strokeWidth={3}
              />
              {t('trust1', { gp: 0 })}
            </span>
            <span className="text-foreground/90 flex items-center gap-1 font-semibold">
              <IconCheck
                size={13}
                className="shrink-0 text-emerald-500"
                strokeWidth={3}
              />
              {t('trust2')}
            </span>
            <span className="text-foreground/90 flex items-center gap-1 font-semibold">
              <IconCheck
                size={13}
                className="shrink-0 text-emerald-500"
                strokeWidth={3}
              />
              {t('trust3', { minutes: 3 })}
            </span>
          </div>
        </div>

        {/* 3D Perspective Safari Mockup Showcase with Floating Live Status Badges */}
        <div
          ref={mockupWrapperRef}
          className="relative mx-auto mt-8 w-full max-w-5xl [perspective:1200px] sm:mt-12 md:mt-16"
        >
          {/* Ambient Glow behind Mockup */}
          <div
            aria-hidden="true"
            className="from-primary/30 pointer-events-none absolute -inset-3 -z-10 rounded-3xl bg-linear-to-r via-orange-500/20 to-amber-500/30 opacity-70 blur-3xl transition-opacity sm:-inset-6 dark:opacity-45"
          />

          {/* 3D Tilting Frame */}
          <div
            ref={mockupInnerRef}
            className="relative origin-top [transform-style:preserve-3d]"
          >
            {/* Safari Window */}
            <div className="bg-background/60 ring-border relative w-full overflow-hidden rounded-2xl border p-1.5 shadow-2xl ring-1 backdrop-blur-xl sm:rounded-3xl sm:p-2.5">
              <Safari
                url="app.sitepow.store"
                className="w-full"
                videoSrc="/hero-section.webm"
              >
                <div className="size-full bg-neutral-200 dark:bg-neutral-800" />
              </Safari>

              {/* Dual Border Beam */}
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

            {/* Bottom Gradient Fade */}
            <div className="from-background via-background/80 pointer-events-none absolute inset-x-0 -bottom-8 h-1/4 bg-linear-to-t to-transparent" />

            {/* Floating Live Feature Widget 1 (Top-Left) */}
            <div
              ref={widget1Ref}
              className="pointer-events-auto absolute -top-4 -left-2 z-20 sm:-top-7 sm:-left-6 md:-top-9 md:-left-8"
            >
              <div className="border-border/80 bg-card/90 text-foreground group flex items-center gap-2.5 rounded-2xl border p-2 shadow-2xl backdrop-blur-xl transition-transform duration-300 hover:scale-105 sm:gap-3 sm:p-3">
                <div className="flex size-8 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-600 sm:size-9 dark:text-emerald-400">
                  <IconReceipt size={18} className="sm:size-5" />
                </div>
                <div className="text-left">
                  <div className="text-foreground flex items-center gap-1.5 text-xs font-bold">
                    <span>{t('widget1Title')}</span>
                    <span className="size-1.5 animate-pulse rounded-full bg-emerald-500" />
                  </div>
                  <p className="text-muted-foreground text-[10px] sm:text-[11px]">
                    {t('widget1Desc', { seconds: '0.5' })}
                  </p>
                </div>
              </div>
            </div>

            {/* Floating Live Feature Widget 2 (Top-Right) */}
            <div
              ref={widget2Ref}
              className="pointer-events-auto absolute -top-4 -right-2 z-20 sm:-top-7 sm:-right-6 md:-top-9 md:-right-8"
            >
              <div className="border-border/80 bg-card/90 text-foreground group flex items-center gap-2.5 rounded-2xl border p-2 shadow-2xl backdrop-blur-xl transition-transform duration-300 hover:scale-105 sm:gap-3 sm:p-3">
                <div className="flex size-8 items-center justify-center rounded-xl bg-linear-to-tr from-orange-500/20 to-amber-500/20 text-orange-600 sm:size-9 dark:text-orange-400">
                  <IconSparkles size={18} className="sm:size-5" />
                </div>
                <div className="text-left">
                  <div className="text-foreground flex items-center gap-1.5 text-xs font-bold">
                    <span>{t('widget2Title')}</span>
                    <span className="rounded-full bg-emerald-500/15 px-1.5 py-0.5 text-[9px] font-bold text-emerald-600 dark:text-emerald-400">
                      {t('widget2Badge', { accuracy: 100 })}
                    </span>
                  </div>
                  <p className="text-muted-foreground text-[10px] sm:text-[11px]">
                    {t('widget2Desc', { amount: '฿1,890' })}
                  </p>
                </div>
              </div>
            </div>

            {/* Floating Live Feature Widget 3 (Bottom-Right) */}
            <div
              ref={widget3Ref}
              className="pointer-events-auto absolute -right-1 -bottom-4 z-20 hidden sm:-right-6 sm:-bottom-5 sm:flex md:-right-8 md:-bottom-6"
            >
              <div className="border-border/80 bg-card/90 text-foreground group flex items-center gap-2.5 rounded-2xl border p-2 shadow-2xl backdrop-blur-xl transition-transform duration-300 hover:scale-105 sm:gap-3 sm:p-3">
                <div className="bg-primary/15 text-primary flex size-8 items-center justify-center rounded-xl sm:size-9">
                  <IconChartBar size={18} className="sm:size-5" />
                </div>
                <div className="text-left">
                  <div className="text-foreground flex items-center gap-1.5 text-xs font-bold">
                    <span>{t('widget3Title', { gp: 0 })}</span>
                    <span className="text-[9px] font-bold text-emerald-600 sm:text-[10px] dark:text-emerald-400">
                      {t('widget3Badge', { profit: 34 })}
                    </span>
                  </div>
                  <p className="text-muted-foreground text-[10px] sm:text-[11px]">
                    {t('widget3Desc')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
