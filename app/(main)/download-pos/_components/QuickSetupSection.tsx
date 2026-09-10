'use client'
import { useRef } from 'react'

import { useTranslations } from 'next-intl'

import {
  IconBuildingStore,
  IconDownload,
  IconPlugConnected,
} from '@tabler/icons-react'

import { BorderBeam } from '@/components/magicui/border-beam'
import { Safari } from '@/components/magicui/safari'

import { ScrollTrigger, gsap, useGSAP } from '@/lib/gsap'

import { MainSectionHeader } from '../../_components/MainSectionHeader'

const STEP_ICONS = [
  <IconDownload key="dl" size={18} className="sm:size-5" />,
  <IconBuildingStore key="bs" size={18} className="sm:size-5" />,
  <IconPlugConnected key="pc" size={18} className="sm:size-5" />,
]

export function QuickSetupSection() {
  const t = useTranslations('downloadPos.quickSetup')
  const sectionRef = useRef<HTMLDivElement>(null)
  const headerRef = useRef<HTMLDivElement>(null)
  const stepsRef = useRef<HTMLDivElement>(null)
  const mockupWrapperRef = useRef<HTMLDivElement>(null)
  const mockupInnerRef = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })

      if (headerRef.current) {
        tl.fromTo(
          headerRef.current,
          { y: 35, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.8,
            scrollTrigger: {
              trigger: headerRef.current,
              start: 'top 90%',
              toggleActions: 'play none none none',
            },
          },
        )
      }

      if (stepsRef.current) {
        const stepItems = Array.from(stepsRef.current.children)
        stepItems.forEach((step) => {
          gsap.fromTo(
            step,
            { y: 45, opacity: 0 },
            {
              y: 0,
              opacity: 1,
              duration: 0.85,
              ease: 'power3.out',
              scrollTrigger: {
                trigger: step,
                start: 'top 90%',
                toggleActions: 'play none none none',
              },
            },
          )
        })
      }

      // 3D Tilt Entrance & Scrub Scroll (แบบเดียวกับ HeroSection)
      if (mockupInnerRef.current) {
        gsap.fromTo(
          mockupInnerRef.current,
          { rotateX: 18, y: 0, scale: 0.9, opacity: 0 },
          {
            rotateX: 6,
            y: 0,
            scale: 1,
            opacity: 1,
            duration: 1.1,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: mockupWrapperRef.current,
              start: 'top 85%',
              toggleActions: 'play none none none',
            },
          },
        )

        gsap.to(mockupInnerRef.current, {
          rotateX: 0,
          y: -40,
          ease: 'none',
          scrollTrigger: {
            trigger: mockupWrapperRef.current,
            start: 'top bottom',
            end: 'bottom top',
            scrub: 1,
          },
        })
      }

      ScrollTrigger.refresh()
    },
    { scope: sectionRef },
  )

  const steps = [0, 1, 2].map((idx) => ({
    step: `0${idx + 1}`,
    title: t(`steps.${idx}.title`),
    description: t(`steps.${idx}.description`),
    icon: STEP_ICONS[idx],
  }))

  return (
    <div
      ref={sectionRef}
      className="mx-auto w-full max-w-7xl space-y-4 px-3.5 sm:space-y-8 sm:px-6 lg:px-8"
    >
      <div ref={headerRef}>
        <MainSectionHeader
          badge={t('badge')}
          title={t('title')}
          description={t('description')}
        />
      </div>

      {/* 3 Step Cards */}
      <div
        ref={stepsRef}
        className="grid grid-cols-1 gap-3.5 sm:gap-6 md:grid-cols-3"
      >
        {steps.map((s, idx) => (
          <div
            key={idx}
            className="border-border/80 bg-card/60 relative flex flex-col justify-between rounded-2xl border p-4 shadow-xs transition-all duration-300 hover:shadow-md sm:rounded-3xl sm:p-6"
          >
            <div className="space-y-2.5 sm:space-y-4">
              <div className="flex items-center justify-between">
                <span className="bg-primary text-primary-foreground rounded-full px-2.5 py-0.5 text-[11px] font-bold sm:px-3 sm:py-1 sm:text-xs">
                  Step {s.step}
                </span>
                <div className="bg-primary/10 text-primary flex size-8 items-center justify-center rounded-lg sm:size-10 sm:rounded-xl">
                  {s.icon}
                </div>
              </div>
              <h3 className="text-foreground text-base font-bold sm:text-lg">
                {s.title}
              </h3>
              <p className="text-muted-foreground text-xs leading-relaxed sm:text-sm">
                {s.description}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Safari Showcase (โคลนโครงสร้าง 3D & Styling จาก HeroSection) */}
      <div
        ref={mockupWrapperRef}
        className="relative mx-auto mt-6 w-full max-w-5xl pt-2 perspective-distant sm:mt-10 sm:pt-4"
      >
        {/* Glow Layer ด้านหลัง */}
        <div
          aria-hidden="true"
          className="from-primary/30 pointer-events-none absolute -inset-3 -z-10 rounded-3xl bg-linear-to-r via-orange-500/20 to-amber-500/30 opacity-70 blur-3xl transition-opacity sm:-inset-6 dark:opacity-45"
        />

        {/* 3D Transform Inner Container */}
        <div ref={mockupInnerRef} className="relative origin-top transform-3d">
          <div className="bg-background/60 ring-border relative w-full overflow-hidden rounded-2xl border p-1.5 shadow-2xl ring-1 backdrop-blur-xl sm:rounded-3xl sm:p-2.5">
            <Safari
              url="pos.sitepow.store/cashier"
              className="w-full"
              videoSrc="/hero-section.webm" // เปลี่ยนเป็น path วิดีโอที่ต้องการได้เลย
              deferVideo={true}
            >
              <div className="size-full bg-neutral-200 dark:bg-neutral-800" />
            </Safari>

            {/* BorderBeam แบบคู่สลับสีเหมือน HeroSection */}
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
  )
}
