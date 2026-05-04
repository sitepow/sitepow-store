'use client'

import { CATEGORIES } from '@/constants/sites/category'
import { PRODUCTS } from '@/constants/sites/product'
import { formatCurrency } from '@/utils/pricing'

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Slider } from '@/components/ui/slider'

export function ProductFilterControl() {
  const products = PRODUCTS
  const categories = CATEGORIES

  const availableBrands = Array.from(
    new Set(products.map((product) => product.metadata.brand).filter(Boolean)),
  )

  const allPrices = products.flatMap((product) =>
    product.variants.map((variant) => variant.price),
  )

  const minRaw = allPrices.length > 0 ? Math.min(...allPrices) : 0
  const maxRaw = allPrices.length > 0 ? Math.max(...allPrices) : 0

  const currentMaxPrice = Math.ceil(maxRaw / 100) * 100

  return (
    <aside className="w-full shrink-0 space-y-8 xl:sticky xl:top-40 xl:col-span-3">
      <Accordion
        type="multiple"
        defaultValue={['categories']}
        className="w-full"
      >
        <AccordionItem value="categories" className="border-none">
          <AccordionTrigger className="py-2 text-base font-semibold hover:no-underline">
            หมวดหมู่
          </AccordionTrigger>
          <AccordionContent className="space-y-4 pt-4">
            {categories.map((cat) => (
              <div key={cat.slug} className="flex items-center space-x-3">
                <Checkbox id={`cat-${cat.slug}`} />
                <Label
                  htmlFor={`cat-${cat.slug}`}
                  className="cursor-pointer text-sm font-medium"
                >
                  {cat.title}
                </Label>
              </div>
            ))}
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="price" className="border-none">
          <AccordionTrigger className="py-2 text-base font-semibold hover:no-underline">
            ช่วงราคา
          </AccordionTrigger>
          <AccordionContent className="space-y-6 px-2 pt-6">
            <Slider
              defaultValue={[0, currentMaxPrice]}
              max={currentMaxPrice}
              step={100}
            />
            <div className="flex items-center justify-between text-sm font-medium">
              <span>{formatCurrency(minRaw)}</span>
              <span>{formatCurrency(currentMaxPrice)}</span>
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="brands" className="border-none">
          <AccordionTrigger className="py-2 text-base font-semibold hover:no-underline">
            แบรนด์
          </AccordionTrigger>
          <AccordionContent className="space-y-4 pt-4">
            {availableBrands.map((brand) => (
              <div key={brand} className="flex items-center space-x-3">
                <Checkbox id={`brand-${brand}`} />
                <Label
                  htmlFor={`brand-${brand}`}
                  className="cursor-pointer text-sm font-medium"
                >
                  {brand}
                </Label>
              </div>
            ))}
            {availableBrands.length === 0 && (
              <p className="text-muted-foreground text-xs">ไม่มีแบรนด์</p>
            )}
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      <Separator />
      <Button variant="link">ล้างตัวกรองทั้งหมด</Button>
    </aside>
  )
}
