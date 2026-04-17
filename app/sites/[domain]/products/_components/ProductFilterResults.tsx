import { PRODUCTS } from '@/constants/sites/product'

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

import { StorePagination } from '../../_components/Pagination'
import { ProductCard } from '../../_components/product/ProductCard'

export function ProductFilterResults() {
  return (
    <div className="sticky top-5 col-span-9 flex flex-1 flex-col gap-5">
      <div className="mb-6 flex items-center justify-between">
        <p className="text-muted-foreground">
          แสดงทั้งหมด <span>{PRODUCTS.length}</span> รายการ
        </p>

        <Select value="a">
          <SelectTrigger className="w-45">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="a">เรียงตาม: ล่าสุด</SelectItem>
              <SelectItem value="b">ราคา: น้อยไปมาก</SelectItem>
              <SelectItem value="c">ราคา: มากไปน้อย</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
        {PRODUCTS.map((product) => (
          <ProductCard key={product.productId} variant="outline" {...product} />
        ))}
      </div>

      {PRODUCTS.length === 0 && (
        <div className="flex h-64 flex-col items-center justify-center rounded-xl border-2 border-dashed">
          <p className="text-muted-foreground">ไม่พบสินค้าที่คุณกำลังมองหา</p>
        </div>
      )}

      <StorePagination />
    </div>
  )
}
