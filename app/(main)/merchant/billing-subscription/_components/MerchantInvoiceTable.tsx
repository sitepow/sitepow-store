'use client'

import { IconDownload } from '@tabler/icons-react'

import { TableEmptyRow } from '@/components/TableEmptyRow'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

export interface MerchantInvoice {
  id: string
  date: string
  amount: number
  storeName: string
  plan: string
  status: string
}

interface MerchantInvoiceTableProps {
  invoices: MerchantInvoice[]
}

export function MerchantInvoiceTable({ invoices }: MerchantInvoiceTableProps) {
  return (
    <div className="overflow-hidden rounded-xl border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>เลขที่ใบเสร็จ</TableHead>
            <TableHead>สำหรับร้านค้า</TableHead>
            <TableHead>แพลน</TableHead>
            <TableHead>วันที่ชำระ</TableHead>
            <TableHead>ยอดชำระ</TableHead>
            <TableHead>สถานะ</TableHead>
            <TableHead className="text-right"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {invoices?.length !== 0 &&
            invoices.map((invoice) => (
              <TableRow key={invoice.id}>
                <TableCell>
                  <span className="font-medium">{invoice.id}</span>
                </TableCell>
                <TableCell>
                  <span>{invoice.storeName}</span>
                </TableCell>
                <TableCell>
                  <span className="text-sm opacity-60">{invoice.plan}</span>
                </TableCell>
                <TableCell>
                  <span className="text-sm opacity-60">{invoice.date}</span>
                </TableCell>
                <TableCell>
                  <span className="font-medium">
                    ฿{invoice.amount.toLocaleString()}
                  </span>
                </TableCell>
                <TableCell>
                  <Badge variant="default">ชำระแล้ว</Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <IconDownload size={16} />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          {invoices?.length === 0 && (
            <TableEmptyRow
              colSpan={7}
              title="ไม่พบประวัติการชำระเงินของร้านค้าที่คุณเลือก"
            />
          )}
        </TableBody>
      </Table>
    </div>
  )
}
