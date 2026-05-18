'use client'

import { StorePagination } from '@/app/sites/[domain]/_components/Pagination'
import { IconPackage, IconUsers } from '@tabler/icons-react'

import { TableEmptyRow } from '@/components/TableEmptyRow'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

interface Branch {
  id: string
  storeId: string
  name: string
  taxId: string | null
  phone: string | null
  address: string | null
  isActive: boolean
  staffCount: number
  totalStockItems: number
}

interface BranchListTableProps {
  branches: Branch[]
}

export function BranchListTable({ branches }: BranchListTableProps) {
  return (
    <>
      <div className="overflow-hidden rounded-xl border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ข้อมูลสาขา</TableHead>
              <TableHead className="max-w-75">
                เบอร์โทรศัพท์ / ที่อยู่
              </TableHead>
              <TableHead>ทีมงาน</TableHead>
              <TableHead>คลังสินค้า</TableHead>
              <TableHead>สถานะ</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {branches?.length !== 0 &&
              branches.map((branch) => (
                <TableRow key={branch.id}>
                  <TableCell className="max-w-60 min-w-60">
                    <div className="flex flex-col wrap-break-word whitespace-pre-line">
                      <span className="font-medium">{branch.name}</span>
                      <span className="text-primary whitespace text-xs">
                        Tax: {branch.taxId || '-'}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="max-w-72 min-w-72">
                    <div className="flex flex-col space-y-2">
                      <span className="text-muted-foreground text-sm wrap-break-word whitespace-pre-line">
                        {branch.address || '-'}
                      </span>
                      {branch.phone && (
                        <span className="text-muted-foreground text-sm">
                          {branch.phone}
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <IconUsers size={20} className="opacity-60" />
                      <span>{branch.staffCount} คน</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <IconPackage size={20} className="opacity-60" />
                      <span>
                        {branch.totalStockItems.toLocaleString()} ชิ้น
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={branch.isActive ? 'default' : 'secondary'}>
                      {branch.isActive ? 'เปิดใช้งาน' : 'ปิดใช้งาน'}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            {branches?.length === 0 && (
              <TableEmptyRow
                colSpan={5}
                title="ยังไม่มีข้อมูลสาขาในแบรนด์นี้"
                description="ระบบจะสร้างสาขาหลักสำนักงานใหญ่ (HQ) ให้เป็นค่าเริ่มต้นโดยอัตโนมัติ"
              />
            )}
          </TableBody>
        </Table>
      </div>
      <StorePagination />
    </>
  )
}
