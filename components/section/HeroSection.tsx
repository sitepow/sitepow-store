'use client'

import { useTranslations } from 'next-intl'
import Link from 'next/link'

import { UserRole } from '@/generated/prisma/enums'
import { useLandingImages } from '@/hooks/use-landing-images'
import { useSession } from '@/hooks/use-session'
import { IconCheck, IconDownload, IconSparkles } from '@tabler/icons-react'
import { ArrowRight } from 'lucide-react'

import { AnimatedGridPattern } from '@/components/magicui/animated-grid-pattern'
import { AnimatedShinyText } from '@/components/magicui/animated-shiny-text'
import { BorderBeam } from '@/components/magicui/border-beam'
import { Safari } from '@/components/magicui/safari'
import { ShimmerButton } from '@/components/magicui/shimmer-button'
import { DashboardMockupContent } from '@/components/mockups/DashboardMockupContent'

import { LogoBrand } from '../LogoBrand'
import { Button } from '../ui/button'

export function HeroSection() {
  const t = useTranslations('home.hero')
  const { isAuthenticated } = useSession()
  const { currentImage } = useLandingImages({ imageFolder: 'hero-section' })

  const registerParams = new URLSearchParams()
  registerParams.set('role', UserRole.MERCHANT)
  registerParams.set('callbackUrl', '/merchant/dashboard')

  const registerHref = `/register?${registerParams.toString()}`

  return (
    <section className="relative flex flex-col items-center justify-center overflow-hidden bg-slate-950 px-4 pt-32 pb-20 text-center text-white sm:px-8 lg:pt-36">
      {/* Background Grid Pattern from Magic UI */}
      <AnimatedGridPattern
        numSquares={35}
        maxOpacity={0.25}
        duration={3.5}
        repeatDelay={0.5}
        className="[mask-image:radial-gradient(ellipse_at_center,white_30%,transparent_80%)]"
      />

      {/* Ambient Gradient Glow */}
      <div className="bg-primary/20 pointer-events-none absolute -top-40 left-1/2 -z-10 h-[500px] w-[800px] -translate-x-1/2 rounded-full blur-[120px]" />

      <div className="z-10 mx-auto flex max-w-5xl flex-col items-center gap-6">
        {/* Magic UI Shiny Text Badge */}
        <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-1.5 backdrop-blur-md">
          <IconSparkles size={14} className="text-amber-400" />
          <AnimatedShinyText className="text-xs font-medium text-slate-300">
            ระบบจัดการร้านค้าออนไลน์ & POS แบบ All-in-One SaaS
          </AnimatedShinyText>
        </div>

        {/* Hero Title */}
        <h1 className="text-3xl font-extrabold tracking-tight text-balance sm:text-5xl lg:text-6xl">
          {t('title')}
        </h1>

        {/* Subtitle */}
        <p className="max-w-2xl text-base leading-relaxed text-slate-300 sm:text-lg">
          {t('subtitlePrefix')}{' '}
          <LogoBrand className="inline-block text-white" hideLogo /> —
          รวมระบบขายหน้าร้าน (POS), จัดการสต็อกหลายสาขา, ชำระเงิน 0% GP, และ AI
          ตรวจสลิปอัตโนมัติ ไว้ในที่เดียว
        </p>

        {/* Action CTA Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          {!isAuthenticated ? (
            <Link href={registerHref}>
              <ShimmerButton className="text-sm font-semibold sm:text-base">
                <span className="flex items-center gap-2">
                  {t('registerBtn')}
                  <ArrowRight size={18} />
                </span>
              </ShimmerButton>
            </Link>
          ) : (
            <Link href="/merchant/dashboard">
              <ShimmerButton className="text-sm font-semibold sm:text-base">
                <span className="flex items-center gap-2">
                  {t('manageStoreBtn')}
                  <ArrowRight size={18} />
                </span>
              </ShimmerButton>
            </Link>
          )}

          <Button
            variant="outline"
            size="lg"
            asChild
            className="border-white/20 bg-white/5 text-white hover:bg-white/10 hover:text-white"
          >
            <Link href="/pricing">{t('pricingBtn')}</Link>
          </Button>

          <Button
            variant="ghost"
            size="lg"
            asChild
            className="text-slate-400 hover:bg-white/5 hover:text-white"
          >
            <Link href="/">
              <IconDownload size={18} />
              <span>{t('downloadPosBtn')}</span>
            </Link>
          </Button>
        </div>

        {/* Quick Highlights */}
        <div className="flex flex-wrap items-center justify-center gap-4 pt-1 text-xs text-slate-400 sm:gap-8 sm:text-sm">
          <div className="flex items-center gap-1.5">
            <IconCheck size={16} className="text-emerald-400" />
            <span>0% GP ไม่มีหักส่วนแบ่ง</span>
          </div>
          <div className="flex items-center gap-1.5">
            <IconCheck size={16} className="text-emerald-400" />
            <span>ระบบ POS เชื่อมสต็อก Real-time</span>
          </div>
          <div className="flex items-center gap-1.5">
            <IconCheck size={16} className="text-emerald-400" />
            <span>AI ตรวจสลิปโอนเงิน 24 ชม.</span>
          </div>
        </div>

        {/* Magic UI Safari Mockup with Border Beam */}
        <div className="relative mt-8 w-full max-w-5xl rounded-2xl p-1 sm:p-2">
          <div className="relative overflow-hidden rounded-2xl shadow-2xl ring-1 ring-white/15">
            <Safari
              url="app.sitepow.store/merchant/dashboard"
              imageSrc={currentImage ? currentImage : undefined}
              className="w-full shadow-2xl"
            >
              <DashboardMockupContent />
            </Safari>
            <BorderBeam
              size={200}
              duration={10}
              colorFrom="#f97316"
              colorTo="#ec4899"
              borderWidth={2}
            />
          </div>

          {/* Underglow Reflection */}
          <div className="bg-primary/25 pointer-events-none absolute -bottom-10 left-1/2 -z-10 h-32 w-3/4 -translate-x-1/2 rounded-full blur-3xl" />
        </div>
      </div>
    </section>
  )
}
