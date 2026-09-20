'use client'

import { useMemo } from 'react'

import { useTranslations } from 'next-intl'

import { PROFIT_COMPARISON } from '@/constants/pricing'
import { IconSparkles } from '@tabler/icons-react'

import { cn } from '@/lib/utils'

import { MainSectionHeader } from '../../_components/MainSectionHeader'
import { TableScrollHint } from '../../_components/TableScrollHint'

export function ProfitComparisonSection() {
  const t = useTranslations('pricing.profitComparison')

  const columns: string[] = useMemo(
    () => (t.raw('columns') as string[]) || PROFIT_COMPARISON.columns,
    [t],
  )

  const categories = useMemo(() => {
    return PROFIT_COMPARISON.categories.map((cat, cIdx) => ({
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
  }, [t])

  return (
    <section className="mx-auto w-full max-w-7xl space-y-4 px-3.5 sm:space-y-8 sm:px-6 lg:px-8">
      <div>
        <MainSectionHeader as="h3" title={t('title')} />
      </div>

      <TableScrollHint />

      <div className="border-border/80 bg-card/60 w-full overflow-hidden rounded-2xl border shadow-sm backdrop-blur-xs sm:rounded-3xl">
        <div className="overflow-x-auto">
          <table className="w-full min-w-180 border-collapse text-left">
            <thead>
              <tr className="border-border/80 bg-muted/40 border-b">
                <th className="text-muted-foreground w-1/3 p-3 text-xs font-semibold sm:p-5">
                  {columns[0]}
                </th>
                <th className="text-muted-foreground w-1/5 p-3 text-center text-xs font-semibold sm:p-5">
                  {columns[1]}
                </th>
                <th className="text-muted-foreground w-1/5 p-3 text-center text-xs font-semibold sm:p-5">
                  {columns[2]}
                </th>
                <th className="border-primary/25 bg-primary/10 text-primary w-1/4 p-3 text-center sm:p-5">
                  <div className="flex items-center justify-center gap-1.5 text-sm font-bold sm:text-lg">
                    <IconSparkles
                      size={16}
                      className="text-primary sm:size-4.5"
                    />
                    <span>{columns[3]}</span>
                  </div>
                </th>
              </tr>
            </thead>

            <tbody className="divide-border/60 divide-y">
              {categories.map((cat, cIdx) => (
                <ProfitCategoryRows key={cat.name || cIdx} category={cat} />
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  )
}

interface CategoryItem {
  name: string
  features: {
    label: string
    values: string[]
  }[]
}

function ProfitCategoryRows({ category }: { category: CategoryItem }) {
  return (
    <>
      <tr className="bg-muted/70">
        <td
          colSpan={4}
          className="text-foreground/90 px-3 py-2 text-[11px] font-bold sm:px-5 sm:py-3 sm:text-xs"
        >
          {category.name}
        </td>
      </tr>

      {category.features.map((item, fIdx) => (
        <tr key={fIdx} className="hover:bg-muted/30 transition-colors">
          <td className="text-foreground px-3 py-2.5 text-xs font-medium sm:px-5 sm:py-3.5 sm:text-sm">
            {item.label}
          </td>

          {item.values.map((val, vIdx) => {
            const isHighlighted = vIdx === 2
            return (
              <td
                key={vIdx}
                className={cn(
                  'px-3 py-2.5 text-center text-xs sm:px-4 sm:py-3.5 sm:text-sm',
                  isHighlighted
                    ? 'border-primary/15 bg-primary/4 dark:bg-primary/8 text-primary border-x font-semibold'
                    : 'text-muted-foreground',
                )}
              >
                {val}
              </td>
            )
          })}
        </tr>
      ))}
    </>
  )
}
