'use client'
import { useRef } from 'react'

import { useTranslations } from 'next-intl'

import { FeatureComparison } from '@/constants/features'
import { useIsMounted } from '@/hooks/use-is-mounted'
import { IconCheck, IconSparkles, IconX } from '@tabler/icons-react'

import { BorderBeam } from '@/components/magicui/border-beam'

import { ScrollTrigger, gsap, useGSAP } from '@/lib/gsap'

import { MainSectionHeader } from '../../../_components/MainSectionHeader'

export function FeatureComparisonSection({
  comparison,
}: {
  comparison: FeatureComparison
}) {
  const isMounted = useIsMounted()
  const t = useTranslations('features.detail.comparison')
  const sectionRef = useRef<HTMLDivElement>(null)
  const headerRef = useRef<HTMLDivElement>(null)
  const columnsRef = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      if (!isMounted) return

      if (headerRef.current) {
        gsap.fromTo(
          headerRef.current,
          { y: 35, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.8,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: headerRef.current,
              start: 'top 90%',
              toggleActions: 'play none none none',
            },
          },
        )
      }

      if (columnsRef.current) {
        const cols = Array.from(columnsRef.current.children)
        cols.forEach((col) => {
          gsap.fromTo(
            col,
            { y: 45, opacity: 0 },
            {
              y: 0,
              opacity: 1,
              duration: 0.85,
              ease: 'power3.out',
              scrollTrigger: {
                trigger: col,
                start: 'top 90%',
                toggleActions: 'play none none none',
              },
            },
          )
        })
      }

      ScrollTrigger.refresh()
    },
    { scope: sectionRef, dependencies: [isMounted, comparison] },
  )

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
      <div
        ref={columnsRef}
        className="grid grid-cols-1 gap-3.5 sm:gap-6 md:grid-cols-2"
      >
        <div className="relative flex flex-col justify-between rounded-2xl border border-rose-500/20 bg-rose-500/3 p-4 shadow-xs sm:rounded-3xl sm:p-6 dark:bg-rose-500/5">
          <div className="space-y-3.5 sm:space-y-5">
            <div className="flex items-center gap-2.5 sm:gap-3">
              <div className="flex size-8 items-center justify-center rounded-xl bg-rose-500/15 text-rose-600 sm:size-9 dark:text-rose-400">
                <IconX size={18} strokeWidth={2.5} className="sm:size-5" />
              </div>
              <h3 className="text-foreground text-base font-bold sm:text-lg">
                {comparison.traditional.title}
              </h3>
            </div>
            <div className="border-border/40 my-2.5 border-t sm:my-3" />
            <ul className="space-y-2 sm:space-y-3.5">
              {comparison.traditional.points.map((pt, pIdx) => (
                <li
                  key={pIdx}
                  className="flex items-start gap-2.5 text-xs sm:gap-3 sm:text-sm"
                >
                  <div className="mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full bg-rose-500/15 text-rose-600 sm:size-5 dark:text-rose-400">
                    <IconX size={11} strokeWidth={3} className="sm:size-3" />
                  </div>
                  <span className="text-muted-foreground leading-snug">
                    {pt}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="border-primary/40 bg-card/80 shadow-primary/5 relative flex flex-col justify-between rounded-2xl border p-4 shadow-xl backdrop-blur-md sm:rounded-3xl sm:p-6">
          <BorderBeam
            size={140}
            duration={7}
            colorFrom="#10b981"
            colorTo="#3b82f6"
            borderWidth={1.5}
          />
          <div className="space-y-3.5 sm:space-y-5">
            <div className="flex items-center gap-2.5 sm:gap-3">
              <div className="bg-primary/15 text-primary flex size-8 items-center justify-center rounded-xl sm:size-9">
                <IconSparkles size={18} className="sm:size-5" />
              </div>
              <h3 className="text-foreground text-base font-bold sm:text-lg">
                {comparison.sitepow.title}
              </h3>
            </div>
            <div className="border-border/60 my-2.5 border-t sm:my-3" />
            <ul className="space-y-2 sm:space-y-3.5">
              {comparison.sitepow.points.map((pt, pIdx) => (
                <li
                  key={pIdx}
                  className="flex items-start gap-2.5 text-xs sm:gap-3 sm:text-sm"
                >
                  <div className="mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-600 sm:size-5 dark:text-emerald-400">
                    <IconCheck
                      size={11}
                      strokeWidth={3}
                      className="sm:size-3"
                    />
                  </div>
                  <span className="text-foreground/90 leading-snug font-medium">
                    {pt}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
