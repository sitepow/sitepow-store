'use client'
import { useRef } from 'react'

import { useTranslations } from 'next-intl'
import Link from 'next/link'

import { UserRole } from '@/generated/prisma/enums'
import { useIsMounted } from '@/hooks/use-is-mounted'
import { useSession } from '@/hooks/use-session'
import {
  IconBolt,
  IconBuildingStore,
  IconCheck,
  IconCoin,
  IconReceipt,
  IconShieldCheck,
  IconSparkles,
} from '@tabler/icons-react'
import { ArrowRight } from 'lucide-react'

import { AnimatedGridPattern } from '@/components/magicui/animated-grid-pattern'
import { AnimatedShinyText } from '@/components/magicui/animated-shiny-text'
import { BorderBeam } from '@/components/magicui/border-beam'
import { RainbowButton } from '@/components/magicui/rainbow-button'
import { Button } from '@/components/ui/button'

import { ScrollTrigger, gsap, useGSAP } from '@/lib/gsap'

export function CtaSection() {
  const isMounted = useIsMounted()
  const t = useTranslations('home.cta')
  const { isAuthenticated } = useSession()
  const isAuth = isMounted && isAuthenticated
  const registerParams = new URLSearchParams()
  registerParams.set('role', UserRole.MERCHANT)
  registerParams.set('callbackUrl', '/merchant/dashboard')
  const registerHref = `/register?${registerParams.toString()}`

  const sectionRef = useRef<HTMLElement>(null)
  const cardRef = useRef<HTMLDivElement>(null)
  const badgeRef = useRef<HTMLDivElement>(null)
  const titleRef = useRef<HTMLHeadingElement>(null)
  const descRef = useRef<HTMLParagraphElement>(null)
  const ctaRef = useRef<HTMLDivElement>(null)
  const trustRef = useRef<HTMLDivElement>(null)
  const widgetLeftRef = useRef<HTMLDivElement>(null)
  const widgetRightRef = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      if (!isMounted) return

      if (cardRef.current) {
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: cardRef.current,
            start: 'top 85%',
            toggleActions: 'play none none none',
          },
          defaults: { ease: 'power3.out' },
        })

        // 1. Heroic Card Scale & Entrance
        tl.fromTo(
          cardRef.current,
          { scale: 0.93, y: 55, opacity: 0 },
          { scale: 1, y: 0, opacity: 1, duration: 0.85 },
        )

        // 2. Glowing Badge Drop
        if (badgeRef.current) {
          tl.fromTo(
            badgeRef.current,
            { y: -18, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.5 },
            '-=0.45',
          )
        }

        // 3. Headline & Description
        if (titleRef.current) {
          tl.fromTo(
            titleRef.current,
            { y: 25, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.65 },
            '-=0.35',
          )
        }
        if (descRef.current) {
          tl.fromTo(
            descRef.current,
            { y: 20, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.6 },
            '-=0.45',
          )
        }

        // 4. Action Buttons
        if (ctaRef.current) {
          tl.fromTo(
            ctaRef.current,
            { y: 20, opacity: 0, scale: 0.95 },
            {
              y: 0,
              opacity: 1,
              scale: 1,
              duration: 0.6,
              ease: 'back.out(1.4)',
            },
            '-=0.35',
          )
        }

        // 5. Trust Badges Strip
        if (trustRef.current) {
          tl.fromTo(
            trustRef.current,
            { y: 15, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.5 },
            '-=0.3',
          )
        }

        // 6. Floating Glassmorphic Badges
        const widgets = [widgetLeftRef.current, widgetRightRef.current].filter(
          Boolean,
        )

        if (widgets.length > 0) {
          tl.fromTo(
            widgets,
            { scale: 0.75, opacity: 0, y: 30 },
            {
              scale: 1,
              opacity: 1,
              y: 0,
              stagger: 0.15,
              duration: 0.65,
              ease: 'back.out(1.7)',
            },
            '-=0.4',
          )

          // Continuous subtle breathing floating animation
          if (widgetLeftRef.current) {
            gsap.to(widgetLeftRef.current, {
              y: -8,
              duration: 3,
              repeat: -1,
              yoyo: true,
              ease: 'sine.inOut',
            })
          }
          if (widgetRightRef.current) {
            gsap.to(widgetRightRef.current, {
              y: 8,
              duration: 3.4,
              repeat: -1,
              yoyo: true,
              ease: 'sine.inOut',
            })
          }
        }
      }

      ScrollTrigger.refresh()
    },
    { scope: sectionRef, dependencies: [isMounted] },
  )

  return (
    <section
      ref={sectionRef}
      id="cta"
      className="relative w-full overflow-hidden py-14 sm:py-20 md:py-28"
    >
      {/* Background Studio Lighting Mesh */}
      <div className="bg-primary/20 pointer-events-none absolute -top-20 left-1/2 -z-10 h-80 w-[550px] -translate-x-1/2 rounded-full opacity-60 blur-3xl dark:opacity-40" />
      <div className="pointer-events-none absolute -bottom-16 left-1/4 -z-10 h-72 w-72 rounded-full bg-orange-500/15 opacity-50 blur-3xl dark:opacity-30" />
      <div className="pointer-events-none absolute right-1/4 -bottom-16 -z-10 h-72 w-72 rounded-full bg-violet-500/15 opacity-50 blur-3xl dark:opacity-30" />

      <div className="relative mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* World-Class SaaS Heroic CTA Card */}
        <div
          ref={cardRef}
          className="border-border/70 from-card/95 via-card/75 to-card/95 relative mx-auto w-full overflow-hidden rounded-3xl border bg-gradient-to-b px-5 py-12 text-center shadow-2xl backdrop-blur-xl sm:rounded-[36px] sm:px-12 sm:py-16 md:px-16 md:py-20 dark:border-white/10 dark:from-neutral-900/90 dark:via-neutral-950/75 dark:to-neutral-900/90"
        >
          {/* Dual Dynamic Glowing BorderBeam */}
          <BorderBeam
            size={240}
            duration={10}
            colorFrom="#f97316"
            colorTo="#ec4899"
            borderWidth={1.5}
          />
          <BorderBeam
            size={240}
            duration={10}
            delay={5}
            reverse
            colorFrom="#3b82f6"
            colorTo="#10b981"
            borderWidth={1.5}
          />

          {/* Animated Grid Pattern inside the card */}
          <AnimatedGridPattern
            numSquares={24}
            maxOpacity={0.3}
            duration={3}
            className="-z-10 [mask-image:radial-gradient(400px_circle_at_center,white,transparent)] opacity-65 sm:[mask-image:radial-gradient(650px_circle_at_center,white,transparent)] dark:opacity-30"
          />

          {/* Internal Ambient Radial Aura */}
          <div className="bg-primary/15 pointer-events-none absolute top-1/2 left-1/2 -z-10 h-72 w-[480px] -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl" />

          {/* Floating Live Metric Badge 1: Ultra-Fast POS (Desktop / Tablet) */}
          <div
            ref={widgetLeftRef}
            className="border-border/70 bg-card/90 pointer-events-none absolute top-10 -left-2 hidden -rotate-2 rounded-2xl border p-3.5 shadow-xl backdrop-blur-md select-none lg:flex lg:items-center lg:gap-3 dark:border-white/10 dark:bg-neutral-900/90"
          >
            <div className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 text-white shadow-sm">
              <IconBolt className="size-5" />
            </div>
            <div className="text-left">
              <p className="text-foreground text-xs font-bold">
                {t('floatLeftTitle')}
              </p>
              <p className="text-muted-foreground text-[11px]">
                {t('floatLeftDesc', { seconds: '0.5' })}
              </p>
            </div>
          </div>

          {/* Floating Live Metric Badge 2: 0% GP Profit (Desktop / Tablet) */}
          <div
            ref={widgetRightRef}
            className="border-border/70 bg-card/90 pointer-events-none absolute -right-2 bottom-10 hidden rotate-2 rounded-2xl border p-3.5 shadow-xl backdrop-blur-md select-none lg:flex lg:items-center lg:gap-3 dark:border-white/10 dark:bg-neutral-900/90"
          >
            <div className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-sm">
              <IconReceipt className="size-5" />
            </div>
            <div className="text-left">
              <p className="text-foreground text-xs font-bold">
                {t('floatRightTitle', { gp: 0 })}
              </p>
              <p className="text-muted-foreground text-[11px]">
                {t('floatRightDesc', { profit: 100 })}
              </p>
            </div>
          </div>

          {/* Center Content Stack */}
          <div className="mx-auto max-w-3xl space-y-5 sm:space-y-6">
            {/* Top Glowing Announcement Pill */}
            <div
              ref={badgeRef}
              className="border-primary/30 bg-primary/10 text-primary inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-xs font-semibold shadow-xs backdrop-blur-md"
            >
              <span className="relative flex size-2">
                <span className="bg-primary absolute inline-flex h-full w-full animate-ping rounded-full opacity-75" />
                <span className="bg-primary relative inline-flex size-2 rounded-full" />
              </span>
              <IconSparkles className="text-primary size-3.5" />
              <AnimatedShinyText className="inline-flex items-center text-xs font-semibold">
                {t('badge', { minutes: 3 })}
              </AnimatedShinyText>
            </div>

            {/* Headline */}
            <h2
              ref={titleRef}
              className="text-foreground text-2xl font-extrabold tracking-tight text-balance sm:text-4xl md:text-5xl lg:text-[54px] lg:leading-[1.15]"
            >
              {t('title')}
            </h2>

            {/* Description */}
            <p
              ref={descRef}
              className="text-muted-foreground mx-auto max-w-2xl text-xs leading-relaxed text-balance sm:text-base md:text-lg"
            >
              {t('description', { gp: 0 })}
            </p>

            {/* CTA Action Buttons */}
            <div
              ref={ctaRef}
              className="mx-auto flex w-full max-w-md flex-col items-stretch justify-center gap-3 pt-2 sm:max-w-none sm:flex-row sm:items-center sm:gap-4 sm:pt-3"
            >
              {!isAuth ? (
                <RainbowButton
                  size="lg"
                  asChild
                  className="shadow-primary/25 hover:shadow-primary/35 group h-11 w-full px-7 text-sm font-semibold shadow-xl transition-all duration-300 hover:scale-[1.02] sm:h-12 sm:w-auto sm:px-8 sm:text-base"
                >
                  <Link
                    href={registerHref}
                    className="flex items-center justify-center gap-2.5"
                  >
                    <IconBuildingStore className="size-4 sm:size-5" />
                    <span>{t('registerBtn')}</span>
                    <ArrowRight className="size-3.5 transition-transform duration-200 group-hover:translate-x-1 sm:size-4" />
                  </Link>
                </RainbowButton>
              ) : (
                <RainbowButton
                  size="lg"
                  asChild
                  className="shadow-primary/25 hover:shadow-primary/35 group h-11 w-full px-7 text-sm font-semibold shadow-xl transition-all duration-300 hover:scale-[1.02] sm:h-12 sm:w-auto sm:px-8 sm:text-base"
                >
                  <Link
                    href="/merchant/dashboard"
                    className="flex items-center justify-center gap-2.5"
                  >
                    <IconBuildingStore className="size-4 sm:size-5" />
                    <span>{t('dashboardBtn')}</span>
                    <ArrowRight className="size-3.5 transition-transform duration-200 group-hover:translate-x-1 sm:size-4" />
                  </Link>
                </RainbowButton>
              )}
              <Button
                variant="outline"
                size="lg"
                asChild
                className="border-border/70 bg-background/50 hover:bg-muted/80 text-foreground h-11 w-full cursor-pointer px-6 text-xs font-semibold backdrop-blur-md transition-all duration-200 hover:scale-[1.02] sm:h-12 sm:w-auto sm:px-8 sm:text-base"
              >
                <Link href="/pricing" className="text-center">
                  {t('pricingBtn')}
                </Link>
              </Button>
            </div>

            {/* Trust Checklist Strip */}
            <div
              ref={trustRef}
              className="text-muted-foreground flex flex-wrap items-center justify-center gap-x-5 gap-y-2 pt-3 text-[11px] font-medium sm:gap-x-7 sm:text-xs md:text-sm"
            >
              <div className="flex items-center gap-1.5">
                <IconCheck className="size-3.5 text-emerald-500 sm:size-4" />
                <span>{t('trust1')}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <IconBolt className="size-3.5 text-amber-500 sm:size-4" />
                <span>{t('trust2', { minutes: 3 })}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <IconShieldCheck className="text-primary size-3.5 sm:size-4" />
                <span>{t('trust3', { gp: 0, profit: 100 })}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <IconCoin className="size-3.5 text-emerald-500 sm:size-4" />
                <span>{t('trust4')}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
