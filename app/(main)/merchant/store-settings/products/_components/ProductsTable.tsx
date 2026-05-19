import { StorePagination } from '@/app/sites/[domain]/_components/Pagination'
import { formatCurrency, formatNumber } from '@/utils/pricing'
import { IconEdit, IconTrash } from '@tabler/icons-react'

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

export function ProductsTable() {
  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>รหัส</TableHead>
              <TableHead>ชื่อสินค้า</TableHead>
              <TableHead>หมวดหมู่</TableHead>
              <TableHead>ราคา</TableHead>
              <TableHead>สต็อก (แยกสาขา)</TableHead>
              <TableHead>สถานะ</TableHead>
              <TableHead>จัดการ</TableHead>
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
                  <TableCell>{product.id}</TableCell>
                  <TableCell>{product.name}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{product.category}</Badge>
                  </TableCell>
                  <TableCell>{formatCurrency(product.price)}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {product.inventory.map((inv, idx) => (
                        <Badge key={idx} variant="outline">
                          <span>{inv.branchName}</span>
                          <span> {formatNumber(inv.stock)}</span>
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    {totalStock > 0 ? (
                      <Badge>พร้อมขาย</Badge>
                    ) : (
                      <Badge variant="destructive">สินค้าหมด</Badge>
                    )}
                  </TableCell>
                  <TableCell className="space-x-2">
                    <Button variant="outline" size="icon-lg">
                      <IconEdit />
                    </Button>
                    <Button variant="outline" size="icon-lg">
                      <IconTrash />
                    </Button>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>
      <StorePagination />
    </>
  )
}
