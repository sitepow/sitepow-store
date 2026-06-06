import { IconCircleCheck, IconCircleX, IconTrash } from '@tabler/icons-react'

import { TableEmptyRow } from '@/components/TableEmptyRow'
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

interface WishlistItem {
  id: string
  name: string
  storeName: string
  price: number
  discountPrice: number | null
  imageUrl: string
  inStock: boolean
}

interface WishlistTableProps {
  items: WishlistItem[]
  onRemove: (id: string) => void
}

export function WishlistTable({ items, onRemove }: WishlistTableProps) {
  return (
    <>
      <div className="rounded-xl border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-20">สินค้า</TableHead>
              <TableHead>รายละเอียดสินค้า</TableHead>
              <TableHead className="w-44">ราคา</TableHead>
              <TableHead className="w-40">สถานะ</TableHead>
              <TableHead className="w-44 text-right">จัดการ</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items?.length === 0 && (
              <TableEmptyRow
                colSpan={5}
                title="ไม่พบสินค้าในรายการโปรดของคุณ"
              />
            )}
            {items?.length !== 0 &&
              items.map((product) => (
                <TableRow key={product.id}>
                  <TableCell>
                    <div className="bg-muted size-14 overflow-hidden rounded-md border" />
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      <span className="text-foreground line-clamp-1 leading-none font-bold">
                        {product.name}
                      </span>
                      <div className="text-muted-foreground flex items-center gap-1">
                        <span className="truncate">{product.storeName}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-primary font-bold">
                        ฿
                        {(
                          product.discountPrice || product.price
                        ).toLocaleString()}
                      </span>
                      {product.discountPrice && (
                        <span className="text-muted-foreground line-through">
                          ฿{product.price.toLocaleString()}
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {product.inStock ? (
                      <span className="flex shrink-0 items-center gap-1 font-medium text-emerald-600">
                        <IconCircleCheck size={14} />
                        <span>มีสินค้าพร้อมส่ง</span>
                      </span>
                    ) : (
                      <span className="text-destructive flex shrink-0 items-center gap-1 font-medium">
                        <IconCircleX size={14} />
                        <span>สินค้าหมดชั่วคราว</span>
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        size="sm"
                        disabled={!product.inStock}
                        variant={product.inStock ? 'default' : 'secondary'}
                        className="h-8 gap-1.5"
                      >
                        <span>ดูสินค้า</span>
                      </Button>
                      <Button
                        size="icon-lg"
                        variant="outline"
                        onClick={() => onRemove(product.id)}
                      >
                        <IconTrash />
                      </Button>
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
