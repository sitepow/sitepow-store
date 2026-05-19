import {
  IconAlertCircle,
  IconCheck,
  IconCopy,
  IconTicket,
} from '@tabler/icons-react'

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

import { StorePagination } from '../../../_components/Pagination'

interface Voucher {
  id: string
  code: string
  title: string
  description: string
  discountType: string
  discountValue: number
  minSpend: number
  expiryDate: string
  storeName: string
  status: string
}

interface VouchersTableProps {
  vouchers: Voucher[]
  copiedId: string | null
  onCopyCode: (id: string, code: string) => void
}

export function VouchersTable({
  vouchers,
  copiedId,
  onCopyCode,
}: VouchersTableProps) {
  return (
    <div className="flex flex-col space-y-5">
      <div className="bg-background rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-32">สิทธิประโยชน์</TableHead>
              <TableHead>รายละเอียดโค้ดส่วนลด</TableHead>
              <TableHead>ร้านค้า / แบรนด์</TableHead>
              <TableHead className="w-36">วันหมดอายุ</TableHead>
              <TableHead className="w-36 text-right">รหัสส่วนลด</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {vouchers.map((voucher) => {
              const isAvailable = voucher.status === 'AVAILABLE'

              return (
                <TableRow key={voucher.id}>
                  <TableCell>
                    <div className="text-foreground flex items-center gap-1.5 font-bold">
                      <IconTicket
                        size={16}
                        className="text-muted-foreground shrink-0"
                      />
                      <span>
                        {voucher.discountType === 'FIXED'
                          ? `฿${voucher.discountValue}`
                          : `${voucher.discountValue}%`}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-0.5">
                      <span className="text-foreground font-semibold">
                        {voucher.title}
                      </span>
                      <span className="text-muted-foreground text-xs leading-normal">
                        {voucher.description}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{voucher.storeName}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="text-muted-foreground flex items-center gap-1">
                      <IconAlertCircle size={14} />
                      <span>{voucher.expiryDate}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    {isAvailable ? (
                      <Button
                        variant={
                          copiedId === voucher.id ? 'secondary' : 'outline'
                        }
                        onClick={() => onCopyCode(voucher.id, voucher.code)}
                      >
                        {copiedId === voucher.id ? (
                          <>
                            <IconCheck size={14} className="mr-1" />
                            <span>COPIED</span>
                          </>
                        ) : (
                          <>
                            <IconCopy size={14} className="mr-1" />
                            <span>{voucher.code}</span>
                          </>
                        )}
                      </Button>
                    ) : (
                      <Badge className="font-semibold">
                        {voucher.status === 'EXPIRED'
                          ? 'หมดอายุแล้ว'
                          : 'ใช้ไปแล้ว'}
                      </Badge>
                    )}
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>
      <StorePagination />
    </div>
  )
}
