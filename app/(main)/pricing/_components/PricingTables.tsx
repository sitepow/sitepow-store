import React from 'react'

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
  return (
    <SectionContainer>
      <SectionHeader title="เปรียบเทียบ ความสามารถของแต่ละ Package" />

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>เลือก Package ที่เหมาะกับคุณ</TableHead>
            {PRICING_TABLES.tiers.map((tier) => (
              <TableHead key={tier}>{tier}</TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {PRICING_TABLES.categories.map((category) => (
            <React.Fragment key={category.name}>
              <TableRow>
                <TableCell
                  colSpan={PRICING_TABLES.tiers.length + 1}
                  className="bg-foreground/5 dark:text-foreground text-start font-semibold"
                >
                  {category.name}
                </TableCell>
              </TableRow>

              {category.features.map((feature, idx) => (
                <TableRow key={idx}>
                  <TableCell className="text-foreground text-start">
                    {feature.label}
                  </TableCell>
                  {feature.access.map((hasAccess, i) => (
                    <TableCell key={i} className="text-center">
                      {hasAccess ? <CheckCircleIcon /> : <CloseCircleIcon />}
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
