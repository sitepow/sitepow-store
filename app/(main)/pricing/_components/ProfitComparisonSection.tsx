'use client'
import React from 'react'

import { useTranslations } from 'next-intl'

import { PROFIT_COMPARISON } from '@/constants/pricing'
import { IconSparkles } from '@tabler/icons-react'

import { MainSectionHeader } from '../../_components/MainSectionHeader'
import { TableScrollHint } from '../../_components/TableScrollHint'

export function ProfitComparisonSection() {
  const t = useTranslations('pricing.profitComparison')
  const columns: string[] =
    (t.raw('columns') as string[]) || PROFIT_COMPARISON.columns
  const categories = PROFIT_COMPARISON.categories.map((cat, cIdx) => ({
    name: (t.raw(`categories.${cIdx}.name`) as string) || cat.name,
    features: cat.features.map((feat, fIdx) => ({
      label:
        (t.raw(`categories.${cIdx}.features.${fIdx}.label`) as string) ||
        feat.label,
      values:
        (t.raw(`categories.${cIdx}.features.${fIdx}.values`) as string[]) ||
        feat.values,
    })),
  }))
  return (
    <div className="mx-auto w-full max-w-7xl space-y-8 px-4 sm:px-6 lg:px-8">
      <MainSectionHeader
        as="h3"
        badge={t('badge')}
        title={t('title')}
        description={t('description')}
      />
      <TableScrollHint />
      <div className="border-border/80 bg-card/60 w-full overflow-hidden rounded-3xl border shadow-sm backdrop-blur-xs">
        <div className="overflow-x-auto">
          <table className="w-full min-w-180 border-collapse text-left">
            <thead>
              <tr className="border-border/80 bg-muted/40 border-b">
                <th className="text-muted-foreground w-1/3 p-4 text-xs font-semibold sm:p-5">
                  {columns[0]}
                </th>
                <th className="text-muted-foreground w-1/5 p-4 text-center text-xs font-semibold sm:p-5">
                  {columns[1]}
                </th>
                <th className="text-muted-foreground w-1/5 p-4 text-center text-xs font-semibold sm:p-5">
                  {columns[2]}
                </th>
                <th className="border-primary/25 bg-primary/10 text-primary w-1/4 p-4 text-center sm:p-5">
                  <div className="flex items-center justify-center gap-1.5 text-base font-bold sm:text-lg">
                    <IconSparkles size={18} className="text-primary" />
                    <span>{columns[3]}</span>
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-border/60 divide-y">
              {categories.map((cat, cIdx) => (
                <React.Fragment key={cIdx}>
                  <tr className="bg-muted/70">
                    <td
                      colSpan={4}
                      className="text-foreground/90 px-4 py-3 text-xs font-bold sm:px-5"
                    >
                      {cat.name}
                    </td>
                  </tr>
                  {cat.features.map((item, fIdx) => (
                    <tr
                      key={fIdx}
                      className="hover:bg-muted/30 transition-colors"
                    >
                      <td className="text-foreground px-4 py-3.5 text-xs font-medium sm:px-5 sm:text-sm">
                        {item.label}
                      </td>
                      <td className="text-muted-foreground px-4 py-3.5 text-center text-xs sm:text-sm">
                        {item.values[0]}
                      </td>
                      <td className="text-muted-foreground px-4 py-3.5 text-center text-xs sm:text-sm">
                        {item.values[1]}
                      </td>
                      <td className="border-primary/15 bg-primary/4 dark:bg-primary/8 text-primary border-x px-4 py-3.5 text-center text-xs font-semibold sm:text-sm">
                        {item.values[2]}
                      </td>
                    </tr>
                  ))}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
