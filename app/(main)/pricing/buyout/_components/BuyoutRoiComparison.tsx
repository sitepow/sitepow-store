'use client'

import { useMemo, useRef } from 'react'

import { useTranslations } from 'next-intl'

import { MainSectionHeader } from '@/app/(main)/_components/MainSectionHeader'
import { useIsMounted } from '@/hooks/use-is-mounted'
import { IconCheck, IconTrendingUp } from '@tabler/icons-react'

import { ScrollTrigger, gsap, useGSAP } from '@/lib/gsap'
import { cn } from '@/lib/utils'

export function BuyoutRoiComparison() {
  const isMounted = useIsMounted()
  const t = useTranslations('buyout.roi')
  const sectionRef = useRef<HTMLElement>(null)

  useGSAP(
    () => {
      if (!isMounted || !sectionRef.current) {
        return
      }

      const tableCard = sectionRef.current.querySelector(
        '[data-animate="table-card"]',
      )
      if (tableCard) {
        gsap.fromTo(
          tableCard,
          { y: 35, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.8,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: tableCard,
              start: 'top 90%',
              toggleActions: 'play none none none',
            },
          },
        )
      }

      ScrollTrigger.refresh()
    },
    { scope: sectionRef, dependencies: [isMounted] },
  )

  const headers = useMemo(
    () => [0, 1, 2].map((idx) => t(`headers.${idx}`)),
    [t],
  )

  const rows = useMemo(() => {
    try {
      const rawRows = t.raw('rows') as Array<{
        label: string
        monthly: string
        buyout: string
        note: string
      }>
      if (Array.isArray(rawRows)) {
        return rawRows
      }
    } catch {}

    return [0, 1, 2, 3, 4, 5].map((idx) => ({
      label: t(`rows.${idx}.label`),
      monthly: t(`rows.${idx}.monthly`),
      buyout: t(`rows.${idx}.buyout`),
      note: t(`rows.${idx}.note`),
    }))
  }, [t])

  return (
    <section
      ref={sectionRef}
      className="relative mx-auto w-full max-w-5xl space-y-8 px-3.5 sm:space-y-12 sm:px-6 lg:px-8"
    >
      <MainSectionHeader
        as="h2"
        badge={t('badge')}
        title={t('title')}
        description={t('description')}
      />

      <div
        data-animate="table-card"
        className="border-border/80 bg-card/80 overflow-hidden rounded-3xl border shadow-lg backdrop-blur-md"
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead>
              <tr className="border-border/60 bg-muted/50 border-b">
                <th className="text-foreground p-3.5 font-bold sm:p-5">
                  {headers[0]}
                </th>
                <th className="text-muted-foreground p-3.5 font-semibold sm:p-5">
                  {headers[1]}
                </th>
                <th className="bg-primary/10 text-primary p-3.5 font-bold sm:p-5">
                  <div className="flex items-center gap-1.5">
                    <IconTrendingUp className="size-4" />
                    <span>{headers[2]}</span>
                  </div>
                </th>
              </tr>
            </thead>

            <tbody className="divide-border/40 divide-y">
              {rows.map((row, idx) => {
                const isHighlight = idx >= 3

                return (
                  <tr
                    key={idx}
                    className={cn(
                      'hover:bg-muted/30 transition-colors',
                      isHighlight && 'bg-primary/5 font-semibold',
                    )}
                  >
                    <td className="text-foreground p-3.5 sm:p-5">
                      <div className="font-medium">{row.label}</div>
                      {row.note && (
                        <div className="text-muted-foreground pt-0.5 text-[11px]">
                          {row.note}
                        </div>
                      )}
                    </td>

                    <td className="text-muted-foreground p-3.5 sm:p-5">
                      {row.monthly}
                    </td>

                    <td className="text-primary bg-primary/5 p-3.5 font-bold sm:p-5">
                      <div className="flex items-center gap-1.5">
                        {isHighlight && (
                          <IconCheck className="size-4 text-emerald-500" />
                        )}
                        <span>{row.buyout}</span>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  )
}
