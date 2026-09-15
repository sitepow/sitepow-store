'use client'
import { useRef } from 'react'

import { BUYOUT_PLANS } from '@/constants/buyout'
import { useIsMounted } from '@/hooks/use-is-mounted'

import { ScrollTrigger, gsap, useGSAP } from '@/lib/gsap'

import { BuyoutCard } from './BuyoutCard'

export function BuyoutPackages() {
  const isMounted = useIsMounted()
  const sectionRef = useRef<HTMLDivElement>(null)
  const cardsRef = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      if (cardsRef.current) {
        const cards = Array.from(cardsRef.current.children)
        gsap.fromTo(
          cards,
          { y: 45, scale: 0.95, opacity: 0 },
          {
            y: 0,
            scale: 1,
            opacity: 1,
            duration: 0.85,
            stagger: 0.1,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: cardsRef.current,
              start: 'top 88%',
              toggleActions: 'play none none none',
            },
          },
        )
      }

      ScrollTrigger.refresh()
    },
    { scope: sectionRef, dependencies: [isMounted] },
  )

  return (
    <div
      ref={sectionRef}
      className="relative mx-auto w-full max-w-7xl space-y-12 px-3.5 sm:px-6 lg:px-8"
    >
      {/* Background Soft Glow */}
      <div
        aria-hidden="true"
        className="from-primary/15 pointer-events-none absolute top-20 left-1/2 -z-10 h-96 w-full max-w-5xl -translate-x-1/2 rounded-full bg-gradient-to-r via-orange-500/10 to-transparent blur-3xl"
      />

      {/* Buyout Cards Grid (3 columns on lg) */}
      <div
        ref={cardsRef}
        className="grid w-full items-stretch gap-6 sm:grid-cols-2 lg:grid-cols-3"
      >
        {BUYOUT_PLANS.map((plan, idx) => (
          <BuyoutCard key={plan.id} plan={plan} planIndex={idx} />
        ))}
      </div>
    </div>
  )
}
