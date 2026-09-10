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
  IconCheck,
  IconDeviceLaptop,
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
import { getManageUrl } from '@/lib/manage-url'

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
          <h1
            ref={titleRef}
            className="text-foreground text-2xl font-extrabold tracking-tight text-balance sm:text-5xl md:text-6xl"
          >
            {t('titleStart')}{' '}
            <span className="from-primary bg-linear-to-r via-orange-500 to-amber-500 bg-clip-text text-transparent drop-shadow-xs">
              {t('titleGradient')}
            </span>
          </h1>
          <p
            ref={descRef}
            className="text-muted-foreground mx-auto max-w-2xl text-xs leading-relaxed font-normal text-balance sm:text-base md:text-lg lg:text-xl"
          >
            {t('description')}
          </p>
        </div>
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
              <a
                href={getManageUrl('/merchant/dashboard')}
                className="flex items-center justify-center gap-2 text-xs font-bold sm:text-base"
              >
                <IconBuildingStore className="size-4 sm:size-5" />
                <span>{t('manageStoreBtn')}</span>
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
              <span>{t('downloadPosBtn')}</span>
            </Link>
          </Button>
        </div>
        <div
          ref={trustRef}
          className="flex flex-wrap items-center justify-center gap-3 text-xs sm:mt-8 sm:gap-6 sm:text-sm"
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
                {t('ratingText', { rating: '4.9', merchants: '1,200' })}
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
        <div
          ref={mockupWrapperRef}
          className="relative mx-auto mt-8 w-full max-w-5xl perspective-distant sm:mt-12 md:mt-16"
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
                videoSrc="/hero-section.webm"
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
          </div>
        </div>
      </div>
    </section>
  )
}
