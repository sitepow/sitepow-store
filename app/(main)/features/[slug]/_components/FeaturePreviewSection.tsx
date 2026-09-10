'use client'
import { useRef } from 'react'

import { useIsMounted } from '@/hooks/use-is-mounted'

import { BorderBeam } from '@/components/magicui/border-beam'
import { Safari } from '@/components/magicui/safari'

import { ScrollTrigger, gsap, useGSAP } from '@/lib/gsap'

export function FeaturePreviewSection({
  slug,
  imageSrc,
}: {
  slug: string
  imageSrc?: string
}) {
  const isMounted = useIsMounted()
  const sectionRef = useRef<HTMLDivElement>(null)
  const mockupWrapperRef = useRef<HTMLDivElement>(null)
  const mockupInnerRef = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      if (!isMounted) return

      if (mockupInnerRef.current && mockupWrapperRef.current) {
        // 3D Entrance Animation
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

        // Scrub Scroll Animation
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
    { scope: sectionRef, dependencies: [isMounted] },
  )

  return (
    <div
      ref={sectionRef}
      className="relative mx-auto w-full max-w-5xl px-3.5 sm:px-6 lg:px-8"
    >
      <div
        ref={mockupWrapperRef}
        className="relative mx-auto w-full pt-2 perspective-distant sm:pt-4"
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
              url={`app.sitepow.store/${slug}`}
              // imageSrc={imageSrc}
              videoSrc="/hero-section.mp4"
              className="w-full"
            >
              {!imageSrc && (
                <div className="size-full min-h-60 bg-neutral-200 sm:min-h-96 dark:bg-neutral-800" />
              )}
            </Safari>

            {/* Dual BorderBeam สลับสีแบบ HeroSection */}
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
