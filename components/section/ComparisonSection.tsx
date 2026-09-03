'use client'

import React from 'react'

import { useTranslations } from 'next-intl'

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

import { HighlightParser } from '../HighlightParser'
import { SectionContainer } from '../SectionContainer'
import { SectionHeader } from '../SectionHeader'

export function ComparisonSection() {
  const t = useTranslations('home.comparison')

  const columns: string[] = t.raw('columns')
  const categories: Array<{
    name: string
    features: Array<{
      label: string
      values: string[]
    }>
  }> = t.raw('categories')

  return (
    <SectionContainer>
      <SectionHeader
        title={
          <span>
            {t.raw('titlePrefix') as string}{' '}
            <HighlightParser
              className="text-white"
              text={`<hilight>${t.raw('titleHilight') as string}</hilight>`}
            />
          </span>
        }
        description={t.raw('description') as string}
      />
      <Table className="border text-start">
        <TableHeader>
          <TableRow>
            {columns.map((col) => (
              <TableHead key={col}>{col}</TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {categories.map((category) => (
            <React.Fragment key={category.name}>
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="bg-primary font-semibold text-white"
                >
                  {category.name}
                </TableCell>
              </TableRow>
              {category.features.map((feature, idx) => (
                <TableRow key={idx}>
                  <TableCell className="text-foreground font-medium">
                    {feature.label}
                  </TableCell>
                  {feature.values.map((val, i) => (
                    <TableCell key={i}>
                      <div className="flex items-center gap-2">
                        {i === 2 ? <CheckCircleIcon /> : <CloseCircleIcon />}
                        <span>{val}</span>
                      </div>
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </React.Fragment>
          ))}
        </TableBody>
      </Table>
    </SectionContainer>
  )
}
