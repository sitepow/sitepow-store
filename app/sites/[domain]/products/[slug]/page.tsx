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
  Play,
  PlusIcon,
  Share2Icon,
  Star,
  User2,
} from 'lucide-react'

import { SectionContainer } from '@/components/SectionContainer'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from '@/components/ui/input-group'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Separator } from '@/components/ui/separator'

import { StoreLayout } from '../../_components/layout/Layout'

export default async function StoreProductDescriptionPage({
  params,
}: StorePageProps) {
  const { slug } = await params
  const product = PRODUCTS.find((product) => product.slug === slug) as Product
  const { price } = calculateProduct(product)

  const hasSpecs = Object.keys(product.metadata).some((key) => key !== 'tags')
  const hasTags = product.metadata.tags && product.metadata.tags.length > 0

  return (
    <StoreLayout>
      <SectionContainer>
        <div className="grid w-full grid-cols-12 items-start gap-10 text-start">
          <div className="sticky top-5 col-span-7 flex flex-col gap-5">
            <div className="flex items-center justify-between">
              <Link href={'/products'}>
                <Button
                  variant="ghost"
                  className="text-muted-foreground hover:text-primary -ml-4"
                >
                  <ChevronLeft className="mr-2 size-4" />
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
              <div className="size-20 rounded-xl bg-gray-100" />
            </div>

            <div className="mt-10 space-y-6">
              {hasSpecs && (
                <>
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl font-bold">ข้อมูลจำเพาะ</h3>
                    <Separator className="flex-1" />
                  </div>

                  <div className="grid grid-cols-1 gap-y-4 sm:grid-cols-2 sm:gap-x-12">
                    {Object.entries(product.metadata).map(([key, value]) => {
                      if (key === 'tags') return null

                      return (
                        <div key={key} className="flex flex-col border-b pb-2">
                          <span className="text-muted-foreground text-sm capitalize">
                            {key.replace(/_/g, ' ')}
                          </span>
                          <span className="font-medium text-slate-900 capitalize">
                            {Array.isArray(value)
                              ? value
                                  .map((v) =>
                                    typeof v === 'object'
                                      ? `${v.label}: ${v.value}`
                                      : v,
                                  )
                                  .join(', ')
                              : String(value)}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                </>
              )}

              {hasTags && (
                <>
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl font-bold">แท็กสินค้า</h3>
                    <Separator className="flex-1" />
                  </div>

                  <div className="flex flex-wrap gap-2 pt-4">
                    {(product.metadata.tags ?? []).map((tag) => (
                      <Badge key={tag} variant="outline" className="capitalize">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </>
              )}
            </div>

            <div className="mt-20 space-y-8">
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-bold">รีวิวจากลูกค้า</h3>
                <Separator className="flex-1" />
              </div>

              <div className="flex flex-col gap-8 rounded-2xl border bg-slate-50/50 p-6 sm:flex-row">
                <div className="flex flex-col items-center justify-center space-y-2 border-slate-200 sm:border-r sm:pr-8">
                  <span className="text-5xl font-bold text-slate-900">4.8</span>
                  <div className="flex text-yellow-400">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        size={18}
                        fill={i < 4 ? 'currentColor' : 'none'}
                      />
                    ))}
                  </div>
                  <span className="text-muted-foreground text-xs font-medium">
                    120 รีวิวทั้งหมด
                  </span>
                </div>

                <div className="flex-1 space-y-2.5">
                  {[5, 4, 3, 2, 1].map((star) => (
                    <div key={star} className="flex items-center gap-4 text-sm">
                      <span className="w-3 font-semibold text-slate-700">
                        {star}
                      </span>
                      <Progress
                        value={star === 5 ? 85 : star === 4 ? 10 : 5}
                        className="h-2"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-10 pt-4">
                {[
                  {
                    id: 1,
                    user: 'สมชาย รักดี',
                    rating: 5,
                    date: '12 เม.ย. 2026',
                    comment:
                      'สินค้าคุณภาพดีมากครับ การแพ็คของมาอย่างดี จัดส่งไวมาก แนะนำเลย!',
                    images: [
                      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400',
                    ],
                    video: null,
                  },
                  {
                    id: 2,
                    user: 'Jane Doe',
                    rating: 4,
                    date: '10 เม.ย. 2026',
                    comment:
                      'ใช้งานได้ดีตามสเปคที่แจ้งไว้ สีสวยถูกใจมากค่ะ แต่ขนส่งแอบช้านิดหน่อย',
                    images: [
                      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400',
                    ],
                    video: 'https://www.w3schools.com/html/mov_bbb.mp4',
                  },
                ].map((review) => (
                  <div key={review.id} className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar className="size-8 border">
                          <AvatarImage src="" />
                          <AvatarFallback>
                            <User2 size={16} />
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm leading-none font-bold text-slate-900">
                            {review.user}
                          </p>
                          <div className="mt-1.5 flex text-yellow-400">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                size={12}
                                fill={
                                  i < review.rating ? 'currentColor' : 'none'
                                }
                              />
                            ))}
                          </div>
                          <span className="text-muted-foreground text-xs">
                            {review.date}
                          </span>
                          <span className="text-muted-foreground text-xs">
                            | ตัวเลือกสินค้า: กางเกง (50 ชิ้น) M = 6-11 กก.
                          </span>
                        </div>
                      </div>
                    </div>

                    <p className="text-sm leading-relaxed text-slate-600">
                      {review.comment}
                    </p>

                    <div className="flex flex-wrap gap-2.5">
                      {review.video && (
                        <div className="group relative size-24 cursor-pointer overflow-hidden rounded-xl bg-slate-100">
                          {/* <video
                            src={review.video}
                            className="h-full w-full object-cover"
                          /> */}
                          <div className="absolute inset-0 flex items-center justify-center transition-colors group-hover:bg-black/40">
                            <Play className="size-7 fill-white text-white" />
                          </div>
                        </div>
                      )}
                      {review.images.map((img, i) => (
                        <div
                          key={i}
                          className="size-24 overflow-hidden rounded-xl bg-slate-50"
                        >
                          {/* <img
                            src={img}
                            alt="review"
                            className="size-full object-cover"
                          /> */}
                        </div>
                      ))}
                    </div>
                    <Separator className="mt-6 opacity-50" />
                  </div>
                ))}
              </div>
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

              <p>
                ซื้อสินค้านี้รับ{' '}
                <span className="text-primary text-lg font-bold">+ 50</span>{' '}
                แต้มสะสม
              </p>
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
                      <Badge
                        variant="outline"
                        className="border-primary text-primary"
                      >
                        * จำเป็น
                      </Badge>
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
                            <span className="text-primary text-sm font-semibold">
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
