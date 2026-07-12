import React from 'react'

import { PROFIT_COMPARISON } from '@/constants/pricing'

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

import { SectionContainer } from '../SectionContainer'
import { SectionHeader } from '../SectionHeader'

export function ComparisonSection() {
  return (
    <SectionContainer>
      <SectionHeader
        title="ตารางเปรียบเทียบ การขายสินค้าใน แพลตฟอร์มออนไลน์"
        description="ลองเช็คให้ชัดว่ากำไรเหลือเท่าไหร่หลังหักค่าธรรมเนียม และมาดูเหตุการณ์จริงที่คุณอาจต้องเจอเมื่อขายผ่านแพลตฟอร์ม"
      />
      <Table className="border text-start">
        <TableHeader>
          <TableRow>
            {PROFIT_COMPARISON.columns.map((col) => (
              <TableHead key={col}>{col}</TableHead>
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
