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
        title={
          <>
            <span className="text-primary">ตารางเปรียบเทียบ</span>{' '}
            การขายสินค้าในแพลตฟอร์มออนไลน์
          </>
        }
        description="ลองเช็คดูว่าคุณเหลือเงินกี่บาทจากการขาย? เปลี่ยนมาใช้ระบบที่ให้คุณเป็นเจ้าของกำไร 100% กันเถอะ"
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
                  className="bg-foreground/5 dark:text-foreground font-semibold"
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
                    <TableCell
                      key={i}
                      className={`${i === 1 ? 'text-primary font-bold' : 'text-muted-foreground'}`}
                    >
                      <div className="flex items-center gap-2">
                        {i === 1 ? <CheckCircleIcon /> : <CloseCircleIcon />}
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
