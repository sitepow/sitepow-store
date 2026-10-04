import React from 'react'

import { PROFIT_COMPARISON } from '@/constants/billing/pricing'

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

import { HighlightParser } from '../HighlightParser'
import { SectionContainer } from '../SectionContainer'
import { SectionHeader } from '../SectionHeader'

export function ComparisonSection() {
  return (
    <SectionContainer>
      <SectionHeader
        title={
          <span>
            ตารางเปรียบเทียบ{' '}
            <HighlightParser
              className="text-white"
              text="<hilight>การขายสินค้าในแพลตฟอร์มออนไลน์</hilight>"
            />
          </span>
        }
        description="ลองเช็คให้ชัดว่ากำไรเหลือเท่าไหร่หลังหักค่าธรรมเนียม และมาดูเหตุการณ์จริงที่คุณอาจต้องเจอเมื่อขายผ่านแพลตฟอร์ม"
      />
      <Table className="border text-start">
        <TableCaption className="sr-only">
          ตารางเปรียบเทียบค่าธรรมเนียมและคุณสมบัติระหว่างแพลตฟอร์มออนไลน์ทั่วไปกับ Sitepow Store
        </TableCaption>
        <TableHeader>
          <TableRow>
            {PROFIT_COMPARISON.columns.map((col) => (
              <TableHead key={col} scope="col">
                {col}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {PROFIT_COMPARISON.categories.map((category) => (
            <React.Fragment key={category.name}>
              <TableRow>
                <TableCell
                  colSpan={PROFIT_COMPARISON.columns.length}
                  className="bg-primary font-semibold text-white"
                  role="rowheader"
                >
                  {category.name}
                </TableCell>
              </TableRow>
              {category.features.map((feature, idx) => (
                <TableRow key={idx}>
                  <TableHead
                    scope="row"
                    className="text-foreground font-medium"
                  >
                    {feature.label}
                  </TableHead>
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
