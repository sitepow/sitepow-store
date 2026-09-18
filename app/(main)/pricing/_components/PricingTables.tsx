'use client'

import { useMemo, useRef } from 'react'

import { useTranslations } from 'next-intl'

import { PRICING_TABLES } from '@/constants/pricing'
import { Check, Minus } from 'lucide-react'

import { gsap, useGSAP } from '@/lib/gsap'
import { cn } from '@/lib/utils'

import { MainSectionHeader } from '../../_components/MainSectionHeader'
import { TableScrollHint } from '../../_components/TableScrollHint'

export function PricingTables() {
  const t = useTranslations('pricing.tables')
  const sectionRef = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      if (!sectionRef.current) {
        return
      }

      const header = sectionRef.current.querySelector('[data-animate="header"]')
      const tableCard = sectionRef.current.querySelector(
        '[data-animate="table-card"]',
      )

      if (header) {
        gsap.fromTo(
          header,
          { y: 35, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.8,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: header,
              start: 'top 90%',
              toggleActions: 'play none none none',
            },
          },
        )
      }

      if (tableCard) {
        gsap.fromTo(
          tableCard,
          { y: 40, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.85,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: tableCard,
              start: 'top 88%',
              toggleActions: 'play none none none',
            },
          },
        )
      }
    },
    { scope: sectionRef },
  )

  const tiers: string[] = useMemo(
    () => (t.raw('tiers') as string[]) || PRICING_TABLES.tiers,
    [t],
  )

  return (
    <section
      ref={sectionRef}
      className="mx-auto w-full max-w-7xl space-y-4 px-3.5 sm:space-y-8 sm:px-6 lg:px-8"
    >
      <div data-animate="header">
        <MainSectionHeader
          as="h3"
          badge={t('badge')}
          title={
            (t.raw('title') as string) ||
            'เปรียบเทียบความสามารถของแต่ละ Package'
          }
          description={t('description')}
        />
      </div>

      <TableScrollHint />

      <div
        data-animate="table-card"
        className="border-border/80 bg-card/60 w-full overflow-hidden rounded-2xl border shadow-sm backdrop-blur-xs sm:rounded-3xl"
      >
        <div className="overflow-x-auto">
          <table className="w-full min-w-170 border-collapse text-left">
            <thead>
              <tr className="border-border/80 bg-muted/40 border-b">
                <th className="text-muted-foreground w-2/5 p-3 text-xs font-semibold sm:p-5">
                  {(t.raw('choosePackage') as string) || 'ฟังก์ชัน / แพ็กเกจ'}
                </th>
                {tiers.map((tier) => {
                  const isPro = tier.toLowerCase() === 'pro'
                  return (
                    <th
                      key={tier}
                      className={cn(
                        'w-[15%] p-3 text-center sm:p-5',
                        isPro
                          ? 'border-primary/25 bg-primary/10 text-primary border-x'
                          : 'text-foreground',
                      )}
                    >
                      <div className="flex flex-col items-center gap-1">
                        <span className="text-sm font-bold sm:text-lg">
                          {tier}
                        </span>
                        {isPro && (
                          <span className="bg-primary text-primary-foreground py-0.2 rounded-full px-2 text-[9px] font-semibold">
                            {t('popularBadge')}
                          </span>
                        )}
                      </div>
                    </th>
                  )
                })}
              </tr>
            </thead>

            <tbody className="divide-border/60 divide-y">
              {PRICING_TABLES.categories.map((category, catIdx) => {
                const categoryName =
                  (t.raw(`categories.${catIdx}.name`) as string) ||
                  category.name

                return (
                  <TableCategoryGroup
                    key={category.name}
                    categoryName={categoryName}
                    category={category}
                    catIdx={catIdx}
                    tiers={tiers}
                    t={t}
                  />
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  )
}

function TableCategoryGroup({
  categoryName,
  category,
  catIdx,
  tiers,
  t,
}: {
  categoryName: string
  category: (typeof PRICING_TABLES.categories)[number]
  catIdx: number
  tiers: string[]
  t: ReturnType<typeof useTranslations>
}) {
  return (
    <>
      <tr className="bg-muted/70">
        <td
          colSpan={tiers.length + 1}
          className="text-foreground/90 px-3 py-2 text-[11px] font-bold sm:px-5 sm:py-3 sm:text-xs"
        >
          {categoryName}
        </td>
      </tr>

      {category.features.map((feature, idx) => {
        const featureLabel =
          (t.raw(`categories.${catIdx}.features.${idx}`) as string) ||
          feature.label

        return (
          <tr key={idx} className="hover:bg-muted/30 transition-colors">
            <td className="text-foreground px-3 py-2.5 text-xs font-medium sm:px-5 sm:py-3.5 sm:text-sm">
              {featureLabel}
            </td>

            {feature.access.map((hasAccess, i) => {
              const isPro = tiers[i]?.toLowerCase() === 'pro'
              return (
                <td
                  key={i}
                  className={cn(
                    'px-3 py-2.5 text-center sm:px-4 sm:py-3.5',
                    isPro &&
                      'border-primary/15 bg-primary/3 dark:bg-primary/6 border-x',
                  )}
                >
                  <AccessIndicator
                    hasAccess={Boolean(hasAccess)}
                    supportedLabel={t('supported')}
                    notSupportedLabel={t('notSupported')}
                  />
                </td>
              )
            })}
          </tr>
        )
      })}
    </>
  )
}

function AccessIndicator({
  hasAccess,
  supportedLabel,
  notSupportedLabel,
}: {
  hasAccess: boolean
  supportedLabel: string
  notSupportedLabel: string
}) {
  if (hasAccess) {
    return (
      <div
        className="mx-auto flex size-5 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-600 sm:size-6 dark:text-emerald-400"
        title={supportedLabel}
      >
        <Check size={13} strokeWidth={2.5} />
      </div>
    )
  }

  return (
    <div
      className="bg-muted/60 text-muted-foreground/40 mx-auto flex size-5 items-center justify-center rounded-full sm:size-6"
      title={notSupportedLabel}
    >
      <Minus size={12} strokeWidth={2} />
    </div>
  )
}
