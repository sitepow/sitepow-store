import { PRODUCTS } from '@/constants/sites/product'

import { SectionContainer } from '@/components/SectionContainer'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Slider } from '@/components/ui/slider'

import { StorePagination } from '../_components/Pagination'
import { StoreLayout } from '../_components/layout/Layout'
import { ProductCard } from '../_components/product/ProductCard'

export default function StoreProductPage() {
  return (
    <StoreLayout>
      <SectionContainer>
        <div className="grid w-full grid-cols-12 items-start gap-10">
          <aside className="sticky top-5 col-span-3 w-full shrink-0 space-y-8">
            <Accordion
              type="multiple"
              defaultValue={['categories', 'price', 'brands']}
              className="w-full"
            >
              <AccordionItem value="categories" className="border-none">
                <AccordionTrigger className="py-2 text-base font-semibold hover:no-underline">
                  หมวดหมู่
                </AccordionTrigger>
                <AccordionContent className="space-y-4 pt-4">
                  {['ทั้งหมด', 'เสื้อผ้า', 'อุปกรณ์เกมมิ่ง', 'ของสะสม'].map(
                    (cat) => (
                      <div key={cat} className="flex items-center space-x-3">
                        <Checkbox id={cat} />
                        <Label
                          htmlFor={cat}
                          className="cursor-pointer text-sm leading-none font-medium"
                        >
                          {cat}
                        </Label>
                      </div>
                    ),
                  )}
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="price" className="border-none">
                <AccordionTrigger className="py-2 text-base font-semibold hover:no-underline">
                  ช่วงราคา
                </AccordionTrigger>
                <AccordionContent className="space-y-6 px-2 pt-6">
                  <Slider defaultValue={[0, 2000]} max={5000} step={100} />
                  <div className="flex items-center justify-between text-sm font-medium">
                    <span>0 ฿</span>
                    <span>5,000+ ฿</span>
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="brands" className="border-none">
                <AccordionTrigger className="py-2 text-base font-semibold hover:no-underline">
                  แบรนด์
                </AccordionTrigger>
                <AccordionContent className="space-y-4 pt-4">
                  {['Logitech', 'Razer', 'Keychron'].map((brand) => (
                    <div key={brand} className="flex items-center space-x-3">
                      <Checkbox id={brand} />
                      <Label
                        htmlFor={brand}
                        className="cursor-pointer text-sm leading-none font-medium"
                      >
                        {brand}
                      </Label>
                    </div>
                  ))}
                </AccordionContent>
              </AccordionItem>
            </Accordion>

            <Separator />

            <button className="text-primary hover:text-primary/80 text-sm font-medium underline underline-offset-4">
              ล้างตัวกรองทั้งหมด
            </button>
          </aside>

          <main className="sticky top-5 col-span-9 flex flex-1 flex-col gap-5">
            <div className="mb-6 flex items-center justify-between">
              <p className="text-muted-foreground">
                แสดงทั้งหมด <span>{PRODUCTS.length}</span> รายการ
              </p>

              <select className="cursor-pointer bg-transparent font-medium outline-none">
                <option>เรียงตาม: ล่าสุด</option>
                <option>ราคา: น้อยไปมาก</option>
                <option>ราคา: มากไปน้อย</option>
              </select>
            </div>

            <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
              {PRODUCTS.map((product) => (
                <ProductCard
                  key={product.productId}
                  variant="outline"
                  {...product}
                />
              ))}
            </div>

            {PRODUCTS.length === 0 && (
              <div className="flex h-64 flex-col items-center justify-center rounded-xl border-2 border-dashed">
                <p className="text-muted-foreground">
                  ไม่พบสินค้าที่คุณกำลังมองหา
                </p>
              </div>
            )}

            <StorePagination />
          </main>
        </div>
      </SectionContainer>
    </StoreLayout>
  )
}
