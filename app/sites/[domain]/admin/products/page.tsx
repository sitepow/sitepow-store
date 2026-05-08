'use client'

import Link from 'next/link'

import { formatCurrency, formatNumber } from '@/utils/pricing'
import { Edit, MoreHorizontal, Plus, Trash2 } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

import { cn } from '@/lib/utils'

import { DashboardHeader } from '../../_components/DashboardHeader'
import { StorePagination } from '../../_components/Pagination'
import { StoreAdminLayout } from '../../_components/layout/admin/Layout'

const products = [
  {
    id: 'PROD-001',
    name: 'เสื้อยืด Minimalist White',
    category: 'เสื้อผ้า',
    price: 350,
    status: 'active',
    inventory: [
      { branchName: 'สาขาสยาม', stock: 50 },
      { branchName: 'สาขาเซ็นทรัลลาดพร้าว', stock: 70 },
    ],
  },
  {
    id: 'PROD-002',
    name: 'กางเกงยีนส์ Chino Slim Fit',
    category: 'เสื้อผ้า',
    price: 890,
    status: 'active',
    inventory: [
      { branchName: 'สาขาสยาม', stock: 15 },
      { branchName: 'สาขาออนไลน์', stock: 30 },
    ],
  },
  {
    id: 'PROD-003',
    name: 'กระเป๋าผ้า Canvas Eco',
    category: 'เครื่องประดับ',
    price: 150,
    status: 'out_of_stock',
    inventory: [
      { branchName: 'สาขาสยาม', stock: 0 },
      { branchName: 'สาขาออนไลน์', stock: 0 },
    ],
  },
]

export default function StoreAdminProducts() {
  return (
    <StoreAdminLayout>
      <div className="container space-y-8 py-10">
        <div className="flex flex-wrap items-center justify-between gap-2.5">
          <DashboardHeader title="รายการสินค้า" />
          <Link href="/admin/products/new">
            <Button>
              <Plus className="mr-2 size-4" /> เพิ่มสินค้าใหม่
            </Button>
          </Link>
        </div>

        <div className="bg-card rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-25">รหัส</TableHead>
                <TableHead>ชื่อสินค้า</TableHead>
                <TableHead>หมวดหมู่</TableHead>
                <TableHead className="text-right">ราคา</TableHead>
                <TableHead className="w-50 text-right">
                  สต็อก (แยกสาขา)
                </TableHead>
                <TableHead className="text-center">สถานะ</TableHead>
                <TableHead className="text-right">จัดการ</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((product) => {
                const totalStock = product.inventory.reduce(
                  (acc, curr) => acc + curr.stock,
                  0,
                )

                return (
                  <TableRow key={product.id}>
                    <TableCell className="text-muted-foreground text-xs font-medium">
                      {product.id}
                    </TableCell>
                    <TableCell className="font-medium">
                      {product.name}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="font-normal">
                        {product.category}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-semibold">
                      {formatCurrency(product.price)}
                    </TableCell>

                    <TableCell className="text-right">
                      <div className="flex flex-col items-end gap-1.5">
                        <div className="flex flex-wrap justify-end gap-1">
                          {product.inventory.map((inv, idx) => (
                            <TooltipProvider key={idx}>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Badge
                                    variant="outline"
                                    className="px-1.5 py-0 text-[10px] font-normal"
                                  >
                                    <span className="text-muted-foreground mr-1.5 border-r pr-1.5">
                                      {inv.branchName}
                                    </span>
                                    <span
                                      className={cn(
                                        'font-bold',
                                        inv.stock === 0
                                          ? 'text-destructive'
                                          : 'text-foreground',
                                      )}
                                    >
                                      {formatNumber(inv.stock)}
                                    </span>
                                  </Badge>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>
                                    {inv.branchName}: {formatNumber(inv.stock)}{' '}
                                    ชิ้น
                                  </p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          ))}
                        </div>
                        <p className="text-muted-foreground text-[10px] italic">
                          รวมทั้งหมด {formatNumber(totalStock)}
                        </p>
                      </div>
                    </TableCell>

                    <TableCell className="text-center">
                      {totalStock > 0 ? (
                        <Badge className="border-green-200 bg-green-500/10 text-green-600 hover:bg-green-500/10">
                          พร้อมขาย
                        </Badge>
                      ) : (
                        <Badge
                          variant="destructive"
                          className="bg-destructive/10 text-destructive hover:bg-destructive/10 border-destructive/20"
                        >
                          สินค้าหมด
                        </Badge>
                      )}
                    </TableCell>

                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="size-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>การจัดการ</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem>
                            <Edit className="mr-2 size-4" /> แก้ไขข้อมูล
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive">
                            <Trash2 className="mr-2 size-4" /> ลบสินค้า
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
        <StorePagination />
      </div>
    </StoreAdminLayout>
  )
}
