'use client'
import React from 'react'

import { useTranslations } from 'next-intl'

import { PRICING_TABLES } from '@/constants/pricing'
import { Check, Minus } from 'lucide-react'

import { MainSectionHeader } from '../../_components/MainSectionHeader'
import { TableScrollHint } from '../../_components/TableScrollHint'

export function PricingTables() {
  const t = useTranslations('pricing.tables')
  const tiers: string[] = (t.raw('tiers') as string[]) || PRICING_TABLES.tiers
  return (
    <div className="mx-auto w-full max-w-7xl space-y-4 px-3.5 sm:space-y-8 sm:px-6 lg:px-8">
      <MainSectionHeader
        as="h3"
        badge={t('badge')}
        title={
          (t.raw('title') as string) || 'เปรียบเทียบความสามารถของแต่ละ Package'
        }
        description={t('description')}
      />
      <TableScrollHint />
      <div className="border-border/80 bg-card/60 w-full overflow-hidden rounded-2xl border shadow-sm backdrop-blur-xs sm:rounded-3xl">
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
                      className={`w-[15%] p-3 text-center sm:p-5 ${
                        isPro
                          ? 'border-primary/25 bg-primary/10 text-primary border-x'
                          : 'text-foreground'
                      }`}
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
                  <React.Fragment key={category.name}>
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
                        (t.raw(
                          `categories.${catIdx}.features.${idx}`,
                        ) as string) || feature.label
                      return (
                        <tr
                          key={idx}
                          className="hover:bg-muted/30 transition-colors"
                        >
                          <td className="text-foreground px-3 py-2.5 text-xs font-medium sm:px-5 sm:py-3.5 sm:text-sm">
                            {featureLabel}
                          </td>
                          {feature.access.map((hasAccess, i) => {
                            const isPro = tiers[i]?.toLowerCase() === 'pro'
                            return (
                              <td
                                key={i}
                                className={`px-3 py-2.5 text-center sm:px-4 sm:py-3.5 ${
                                  isPro
                                    ? 'border-primary/15 bg-primary/3 dark:bg-primary/6 border-x'
                                    : ''
                                }`}
                              >
                                {hasAccess ? (
                                  <div
                                    className="mx-auto flex size-5 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-600 sm:size-6 dark:text-emerald-400"
                                    title={t('supported')}
                                  >
                                    <Check size={13} strokeWidth={2.5} />
                                  </div>
                                ) : (
                                  <div
                                    className="bg-muted/60 text-muted-foreground/40 mx-auto flex size-5 items-center justify-center rounded-full sm:size-6"
                                    title={t('notSupported')}
                                  >
                                    <Minus size={12} strokeWidth={2} />
                                  </div>
                                )}
                              </td>
                            )
                          })}
                        </tr>
                      )
                    })}
                  </React.Fragment>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
