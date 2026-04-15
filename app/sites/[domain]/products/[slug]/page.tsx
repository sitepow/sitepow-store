import Link from 'next/link'

import { PRODUCTS } from '@/constants/sites/product'
import { StorePageProps } from '@/types/sites/page'
import { Product } from '@/types/sites/product'
import { formatCurrency } from '@/utils/pricing'
import { calculateProduct } from '@/utils/product'
import {
  ChevronLeft,
  HeartIcon,
  MinusIcon,
  PlusIcon,
  Share2Icon,
} from 'lucide-react'

import { SectionContainer } from '@/components/SectionContainer'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from '@/components/ui/input-group'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Separator } from '@/components/ui/separator'

import { StoreLayout } from '../../_components/layout/Layout'

export default async function StoreProductDescriptionPage({
  params,
}: StorePageProps) {
  const { slug } = await params
  const product = PRODUCTS.find((product) => product.slug === slug) as Product
  const { price } = calculateProduct(product)

  return (
    <StoreLayout>
      <SectionContainer>
        <div className="grid w-full grid-cols-12 items-start gap-10 text-start">
          <div className="sticky top-5 col-span-7 flex flex-col gap-5">
            <div className="flex items-center justify-between">
              <Link href={'/'}>
                <Button variant="outline">
                  <ChevronLeft />
                  <span>ย้อนกลับ</span>
                </Button>
              </Link>

              <div className="flex gap-2.5">
                <Button variant="outline">
                  <HeartIcon />
                </Button>
                <Button variant="outline">
                  <Share2Icon />
                </Button>
              </div>
            </div>

            <div className="h-96 rounded-xl bg-gray-100" />
            <div className="flex gap-2.5">
              <div className="size-20 rounded-xl bg-gray-100" />
              <div className="size-20 rounded-xl bg-gray-100" />
              <div className="size-20 rounded-xl bg-gray-100" />
              <div className="size-20 rounded-xl bg-gray-100" />
              <div className="size-20 rounded-xl bg-gray-100" />
              <div className="size-20 rounded-xl bg-gray-100" />
            </div>
          </div>

          <div className="sticky top-5 col-span-5 flex flex-col gap-5 rounded-xl">
            <h1 className="text-start text-4xl leading-tight font-bold">
              {product?.title}
            </h1>

            <div className="flex flex-col gap-2.5">
              <Label className="text-lg font-semibold">ราคาสินค้า</Label>

              <div className="flex items-end gap-2">
                <data value={price?.net?.min} className="text-5xl font-bold">
                  {formatCurrency(price?.net?.min || 0)}
                </data>
                <span className="mb-0.5 text-xl font-bold">THB</span>
              </div>
            </div>

            {product?.variants?.length !== 0 && <Separator />}

            <div className="space-y-4">
              <Label className="text-lg font-semibold">ตัวเลือกสินค้า</Label>
              <RadioGroup defaultValue={product.variants[0].variantId}>
                {product.variants.map((variant) => (
                  <div
                    key={variant.variantId}
                    className="hover:bg-accent flex items-center space-y-0 space-x-3 rounded-lg border p-3 transition-colors"
                  >
                    <RadioGroupItem
                      value={variant.variantId}
                      id={variant.variantId}
                    />
                    <Label
                      htmlFor={variant.variantId}
                      className="flex-1 cursor-pointer font-medium"
                    >
                      {variant.title}
                    </Label>
                    <span className="text-sm font-semibold">
                      {formatCurrency(variant.price)}
                    </span>
                  </div>
                ))}
              </RadioGroup>
            </div>

            {product?.options?.length !== 0 && <Separator />}

            {product.options &&
              product.options.map((option, idx) => (
                <div key={idx} className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Label className="text-lg font-semibold">
                      {option.title}
                    </Label>
                    {option.require && (
                      <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-600">
                        จำเป็น
                      </span>
                    )}
                  </div>
                  <RadioGroup defaultValue={option.choices[0].name}>
                    <div className="grid grid-cols-1 gap-2">
                      {option.choices.map((choice) => (
                        <div
                          key={choice.name}
                          className="flex items-center space-x-3 rounded-lg border p-3"
                        >
                          <RadioGroupItem
                            value={choice.name}
                            id={choice.name}
                          />
                          <Label
                            htmlFor={choice.name}
                            className="flex-1 cursor-pointer"
                          >
                            {choice.name}
                          </Label>
                          {choice.extraPrice > 0 && (
                            <span className="text-primary text-sm">
                              +{formatCurrency(choice.extraPrice)}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </RadioGroup>
                </div>
              ))}

            {product?.addons?.length !== 0 && <Separator />}

            {product.addons && product.addons.length > 0 && (
              <div className="space-y-4">
                <Label className="text-lg font-semibold">บริการเสริม</Label>
                <div className="space-y-2">
                  {product.addons.map((addon) => (
                    <div
                      key={addon.addonId}
                      className="flex items-center space-x-3 rounded-lg border p-3"
                    >
                      <Checkbox
                        id={addon.addonId}
                        disabled={!addon.isAvailable}
                      />
                      <div className="grid flex-1 gap-1.5 leading-none">
                        <Label
                          htmlFor={addon.addonId}
                          className="cursor-pointer text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          {addon.title}
                        </Label>
                      </div>
                      <span className="text-sm font-semibold">
                        +{formatCurrency(addon.price)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {product?.addons?.length !== 0 && <Separator />}

            <div className="flex flex-col gap-2.5">
              <Label className="text-lg font-semibold">จำนวน</Label>

              <InputGroup className="max-w-35">
                <InputGroupAddon align="inline-start" className="border-r p-0">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="hover:bg-muted size-9 rounded-none"
                  >
                    <MinusIcon className="size-4" />
                  </Button>
                </InputGroupAddon>

                <InputGroupInput
                  type="number"
                  defaultValue={1}
                  className="h-9 [appearance:textfield] border-none text-center focus-visible:ring-0 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                />

                <InputGroupAddon align="inline-end" className="border-l p-0">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="hover:bg-muted size-9 rounded-none"
                  >
                    <PlusIcon className="size-4" />
                  </Button>
                </InputGroupAddon>
              </InputGroup>
            </div>

            <Button size="lg" className="mt-4 h-14 w-full text-lg shadow-lg">
              เพิ่มลงตะกร้า
            </Button>
          </div>
        </div>
      </SectionContainer>
    </StoreLayout>
  )
}
