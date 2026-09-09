'use client'
import { useRef } from 'react'

import { useIsMounted } from '@/hooks/use-is-mounted'

import { BorderBeam } from '@/components/magicui/border-beam'
import { Safari } from '@/components/magicui/safari'

import { ScrollTrigger, gsap, useGSAP } from '@/lib/gsap'

export function FeaturePreviewSection({ slug }: { slug: string }) {
  const isMounted = useIsMounted()
  const containerRef = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      if (!isMounted) return
      if (containerRef.current) {
        gsap.fromTo(
          containerRef.current,
          { scale: 0.94, y: 50, opacity: 0 },
          {
            scale: 1,
            y: 0,
            opacity: 1,
            duration: 0.9,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: containerRef.current,
              start: 'top 85%',
              toggleActions: 'play none none none',
            },
          },
        )
      }
      ScrollTrigger.refresh()
    },
    { scope: containerRef, dependencies: [isMounted] },
  )

  return (
    <div
      ref={containerRef}
      className="relative mx-auto w-full max-w-5xl px-3.5 sm:px-6 lg:px-8"
    >
      <div className="bg-card ring-border relative overflow-hidden rounded-2xl border p-1 shadow-2xl ring-1 sm:rounded-3xl sm:p-2">
        <Safari
          url={`app.sitepow.store/${slug}`}
          mode="simple"
          className="w-full"
        >
          <div className="size-full min-h-40 bg-neutral-200 transition-colors sm:min-h-105 dark:bg-neutral-800" />
        </Safari>
        <BorderBeam
          size={200}
          duration={8}
          colorFrom="#f97316"
          colorTo="#3b82f6"
          borderWidth={2}
        />
      </div>
    </div>
  )
}
