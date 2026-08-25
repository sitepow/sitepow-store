'use client'

import Link from 'next/link'

import { formatNumber } from '@/utils/pricing'
import { ArrowRight } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

import { AnalyticsCardShell } from '../../analytics/_components/_components/AnalyticsCardShell'

interface LowStockCardProps {
  data?: {
    lowStock?: Array<{
      id: string
      productName: string
      variantId?: string | null
      variantTitle?: string | null
      branchName: string
      stock: number
    }>
  }
}

export function LowStockCard({ data }: LowStockCardProps) {
  const lowStock = data?.lowStock ?? []

  return (
    <AnalyticsCardShell
      title="สินค้าใกล้หมด"
      description="รายการสินค้าที่ต้องเติมสต็อกด่วน"
      isEmpty={lowStock.length === 0}
      emptyMessage="ขณะนี้ยังไม่มีสินค้าที่ใกล้หมด"
      className="h-fit"
    >
      <div className="space-y-4">
        <Table>
          <TableHeader>
            <TableRow>
              <TableCell className="font-medium">
                สินค้า / รหัสตัวเลือก / ชื่อตัวเลือก
              </TableCell>
              <TableCell className="font-medium">สาขา</TableCell>
              <TableCell className="text-right font-medium">คงเหลือ</TableCell>
            </TableRow>
          </TableHeader>
          <TableBody>
            {lowStock.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="max-w-72 min-w-72 py-3 wrap-break-word whitespace-pre-line">
                  <div className="space-y-0.5">
                    <p className="text-sm font-medium">{item.productName}</p>
                    {item.variantId && (
                      <span className="text-muted-foreground text-xs">
                        ({item.variantId})
                        <br />
                      </span>
                    )}
                    {item.variantTitle && (
                      <span className="text-muted-foreground text-xs">
                        ({item.variantTitle})
                      </span>
                    )}
                  </div>
                </TableCell>
                <TableCell className="py-3">
                  <Badge variant="outline" className="text-muted-foreground">
                    {item.branchName}
                  </Badge>
                </TableCell>
                <TableCell className="py-3 text-right">
                  <span
                    className={`font-semibold ${
                      item.stock === 0 ? 'text-destructive' : 'text-amber-500'
                    }`}
                  >
                    {formatNumber(item.stock)}
                  </span>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <div className="border-t pt-2">
          <Button variant="outline" className="w-full" asChild>
            <Link href="/merchant/inventory">
              ดูคลังสินค้าทั้งหมด <ArrowRight />
            </Link>
          </Button>
        </div>
      </div>
    </AnalyticsCardShell>
  )
}
