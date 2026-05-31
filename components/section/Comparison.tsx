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
            หยุดจ่าย <span className="text-primary">ค่าธรรมเนียมแพลตฟอร์ม</span>{' '}
            ที่คุณไม่ได้เต็มใจ
          </>
        }
        description="เปรียบเทียบกำไรจากยอดขายที่คุณจะได้รับ เมื่อเปลี่ยนมาใช้ระบบจัดการร้านค้าที่ออกแบบมาเพื่อคนขายของตัวจริง"
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
                  className="bg-gray-100 font-semibold"
                >
                  {category.name}
                </TableCell>
              </TableRow>

              {category.features.map((feature, idx) => (
                <TableRow key={idx}>
                  <TableCell className="font-medium">{feature.label}</TableCell>
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
