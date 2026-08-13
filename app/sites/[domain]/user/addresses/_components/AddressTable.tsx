'use client'

import {
  useAddresses,
  useDeleteAddress,
  useSetDefaultAddress,
} from '@/actions/hooks/storefront/address'
import { formatPromptPay } from '@/utils/slip'
import { IconArrowForward, IconBriefcase, IconHome } from '@tabler/icons-react'

import { DeleteButton } from '@/components/DeleteButton'
import { TableEmptyRow } from '@/components/TableEmptyRow'
import { TableLoadingRow } from '@/components/TableLoadingRow'
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

export function AddressTable() {
  const { data: addresses = [], isLoading } = useAddresses()
  const { mutate: deleteAddress, isPending: isDeletePending } =
    useDeleteAddress()
  const { mutate: setDefault } = useSetDefaultAddress()

  return (
    <div className="rounded-xl border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ที่อยู่</TableHead>
            <TableHead>ผู้รับสินค้า</TableHead>
            <TableHead>เบอร์ติดต่อ</TableHead>
            <TableHead>รายละเอียด</TableHead>
            <TableHead className="text-right">จัดการ</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading && addresses.length === 0 ? (
            <TableLoadingRow colSpan={5} />
          ) : addresses.length === 0 ? (
            <TableEmptyRow colSpan={5} title="คุณยังไม่มีที่อยู่ในระบบ" />
          ) : (
            addresses.map((addr) => (
              <TableRow key={addr.id}>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {addr.name?.includes('ออฟฟิศ') ? (
                      <IconBriefcase size={16} />
                    ) : (
                      <IconHome size={16} />
                    )}
                    <span>{addr.name}</span>
                    {addr.isDefault && <Badge>ที่อยู่หลัก</Badge>}
                  </div>
                </TableCell>
                <TableCell>{addr.receiverName}</TableCell>
                <TableCell>{formatPromptPay(addr.phone)}</TableCell>
                <TableCell className="max-w-72 min-w-72 wrap-break-word whitespace-pre-line">
                  {`${addr.addressLine} ${addr.subDistrict} ${addr.district} ${addr.province} ${addr.postalCode}`}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    {!addr.isDefault && (
                      <Button
                        variant="outline"
                        onClick={() => setDefault(addr.id)}
                      >
                        <IconArrowForward />
                        ตั้งเป็นที่อยู่หลัก
                      </Button>
                    )}
                    <DeleteButton
                      isPending={isDeletePending}
                      onDelete={() => deleteAddress(addr.id)}
                    />
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}
