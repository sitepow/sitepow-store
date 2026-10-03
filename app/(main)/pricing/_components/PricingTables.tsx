import React from 'react'

import { PRICING_TABLES } from '@/constants/pricing'

import { SectionContainer } from '@/components/SectionContainer'
import { SectionHeader } from '@/components/SectionHeader'
import { CheckCircleIcon } from '@/components/icon/CheckCircle'
import { CloseCircleIcon } from '@/components/icon/CloseCircle'
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

export function PricingTables() {
  return (
    <SectionContainer>
      <SectionHeader title="เปรียบเทียบ ความสามารถของแต่ละ Package" />
      <Table className="border">
        <TableCaption className="sr-only">
          เปรียบเทียบความสามารถของแต่ละแพ็กเกจ Sitepow Store
        </TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead scope="col">เลือก Package ที่เหมาะกับคุณ</TableHead>
            {PRICING_TABLES.tiers.map((tier) => (
              <TableHead key={tier} scope="col">
                {tier}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {PRICING_TABLES.categories.map((category) => (
            <React.Fragment key={category.name}>
              <TableRow>
                <TableCell
                  colSpan={PRICING_TABLES.tiers.length + 1}
                  className="bg-primary text-start font-semibold text-white"
                  role="rowheader"
                >
                  {category.name}
                </TableCell>
              </TableRow>
              {category.features.map((feature, idx) => (
                <TableRow key={idx}>
                  <TableHead
                    scope="row"
                    className="text-foreground text-start"
                  >
                    {feature.label}
                  </TableHead>
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
