import {
  IconBriefcase,
  IconEdit,
  IconHome,
  IconTrash,
} from '@tabler/icons-react'

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

import { StorePagination } from '../../../_components/Pagination'
import { type UserAddress } from '../page'

interface AddressTableProps {
  addresses: UserAddress[]
  onEdit: (address: UserAddress) => void
  onSetDefault: (id: string) => void
  onDelete: (id: string) => void
}

export function AddressTable({
  addresses,
  onEdit,
  onSetDefault,
  onDelete,
}: AddressTableProps) {
  return (
    <>
      <div className="rounded-xl border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ที่อยู่</TableHead>
              <TableHead>ผู้รับสินค้า</TableHead>
              <TableHead>เบอร์ติดต่อ</TableHead>
              <TableHead>รายละเอียดสถานที่</TableHead>
              <TableHead className="text-right">จัดการ</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {addresses.length === 0 && (
              <TableEmptyRow
                colSpan={5}
                title="คุณยังไม่มีข้อมูลที่อยู่จัดส่งในระบบ สามารถกดเพิ่มที่อยู่ใหม่ได้จากปุ่มด้านบนครับ"
              />
            )}
            {addresses.map((addr) => (
              <TableRow key={addr.id}>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {addr.title.includes('ออฟฟิศ') ||
                    addr.title.includes('ทำงาน') ? (
                      <IconBriefcase size={16} />
                    ) : (
                      <IconHome size={16} />
                    )}
                    <span>{addr.title}</span>
                    {addr.isDefault && (
                      <Badge variant="secondary">ที่อยู่หลัก</Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell>{addr.receiverName}</TableCell>
                <TableCell>{addr.phone}</TableCell>
                <TableCell className="max-w-72 min-w-72 wrap-break-word whitespace-pre-line">
                  {addr.details}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    {!addr.isDefault && (
                      <Button
                        variant="outline"
                        onClick={() => onSetDefault(addr.id)}
                      >
                        ตั้งเป็นที่อยู่หลัก
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="icon-lg"
                      onClick={() => onEdit(addr)}
                    >
                      <IconEdit />
                    </Button>
                    {!addr.isDefault && (
                      <Button
                        variant="outline"
                        size="icon-lg"
                        onClick={() => onDelete(addr.id)}
                      >
                        <IconTrash />
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      {/* <StorePagination /> */}
    </>
  )
}
