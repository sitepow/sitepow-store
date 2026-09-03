'use client'

import React from 'react'

import { useTranslations } from 'next-intl'

import { PRICING_TABLES } from '@/constants/pricing'

import { SectionContainer } from '@/components/SectionContainer'
import { SectionHeader } from '@/components/SectionHeader'
import { CheckCircleIcon } from '@/components/icon/CheckCircle'
import { CloseCircleIcon } from '@/components/icon/CloseCircle'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

export function PricingTables() {
  const t = useTranslations('pricing.tables')

  const tiers: string[] = (t.raw('tiers') as string[]) || PRICING_TABLES.tiers

  return (
    <SectionContainer>
      <SectionHeader title={t.raw('title') as string} />
      <Table className="border">
        <TableHeader>
          <TableRow>
            <TableHead>{t.raw('choosePackage') as string}</TableHead>
            {tiers.map((tier) => (
              <TableHead key={tier}>{tier}</TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {PRICING_TABLES.categories.map((category, catIdx) => {
            const categoryName =
              (t.raw(`categories.${catIdx}.name`) as string) || category.name

            return (
              <React.Fragment key={category.name}>
                <TableRow>
                  <TableCell
                    colSpan={tiers.length + 1}
                    className="bg-primary text-start font-semibold text-white"
                  >
                    {categoryName}
                  </TableCell>
                </TableRow>
                {category.features.map((feature, idx) => {
                  const featureLabel =
                    (t.raw(`categories.${catIdx}.features.${idx}`) as string) ||
                    feature.label

                  return (
                    <TableRow key={idx}>
                      <TableCell className="text-foreground text-start">
                        {featureLabel}
                      </TableCell>
                      {feature.access.map((hasAccess, i) => (
                        <TableCell key={i} className="text-center">
                          {hasAccess ? (
                            <CheckCircleIcon />
                          ) : (
                            <CloseCircleIcon />
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                  )
                })}
              </React.Fragment>
            )
          })}
        </TableBody>
      </Table>
    </SectionContainer>
  )
}
