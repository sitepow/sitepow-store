'use client'

import { Controller, useFieldArray, useForm } from 'react-hook-form'

import { generateProductAiAction } from '@/actions/product'
import { productFormSchema } from '@/zod/product'
import { zodResolver } from '@hookform/resolvers/zod'
import { IconImageGeneration } from '@tabler/icons-react'
import { CirclePlus, PlusCircle, Trash2 } from 'lucide-react'
import z from 'zod'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export function CreateProductForm() {
  const form = useForm<z.infer<typeof productFormSchema>>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      title: '',
      slug: '',
      categoryId: '',
      variants: [{ title: 'Standard', price: 0, stock: 0, sku: '' }],
      addons: [],
      metadataFields: [],
      tags: '',
    },
  })

  const {
    fields: variantFields,
    append: appendVariant,
    remove: removeVariant,
  } = useFieldArray({
    control: form.control,
    name: 'variants',
  })

  const {
    fields: addonFields,
    append: appendAddon,
    remove: removeAddon,
  } = useFieldArray({
    control: form.control,
    name: 'addons',
  })

  const {
    fields: metadataFields,
    append: appendMetadata,
    remove: removeMetadata,
  } = useFieldArray({
    control: form.control,
    name: 'metadataFields',
  })

  const onSubmit = (data: z.infer<typeof productFormSchema>) => {
    console.log('Submitted Data:', data)
  }

  const aiGen = async () => {
    try {
      const data = await generateProductAiAction(form.getValues('title'))

      const dynamicFields =
        data.metadata?.details?.map((item) => ({
          key: String(item.key),
          value: String(item.value),
        })) || []

      form.reset({
        ...form.getValues(),
        title: data.title,
        slug: data.slug,
        categoryId: data.categoryId,
        variants: data.variants,
        addons: data.addons || [],
        tags: data.metadata?.tags ? data.metadata.tags.join(', ') : '',
        metadataFields:
          dynamicFields.length > 0
            ? dynamicFields
            : [{ key: 'brand', value: '' }],
      })
    } catch (error) {
      console.error('AI Gen Error:', error)
    }
  }

  return (
    <div className="grid grid-cols-1 items-start gap-10 lg:grid-cols-2">
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-10">
        <FieldSet>
          <FieldLegend variant="label" className="text-xl font-bold">
            ข้อมูลสินค้าพื้นฐาน
          </FieldLegend>
          <FieldGroup className="mt-4 grid gap-6">
            <Controller
              name="title"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>ชื่อสินค้า</FieldLabel>
                  <Input
                    {...field}
                    id={field.name}
                    placeholder="เช่น เสื้อยืดลายพิเศษ"
                    aria-invalid={fieldState.invalid}
                  />
                  <FieldDescription>
                    ชื่อที่จะแสดงบนหน้าร้านค้า
                  </FieldDescription>
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Controller
                name="slug"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={field.name}>URL Slug</FieldLabel>
                    <Input
                      {...field}
                      id={field.name}
                      placeholder="t-shirt-limited"
                      aria-invalid={fieldState.invalid}
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />

              <Controller
                name="categoryId"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={field.name}>หมวดหมู่</FieldLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger
                        id={field.name}
                        aria-invalid={fieldState.invalid}
                      >
                        <SelectValue placeholder="เลือกหมวดหมู่" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="019d8c50-5e3a-7df1-8de0-e260f4f4f8dd">
                          Fashion & Apparel
                        </SelectItem>
                        <SelectItem value="it-gadgets">IT & Gadgets</SelectItem>
                      </SelectContent>
                    </Select>
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
            </div>
          </FieldGroup>
        </FieldSet>

        <FieldSet className="bg-muted/30 rounded-xl border p-6">
          <div className="mb-4 flex items-center justify-between">
            <FieldLegend variant="label" className="text-lg font-semibold">
              ตัวเลือกสินค้า (Variants)
            </FieldLegend>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() =>
                appendVariant({ title: '', price: 0, stock: 0, sku: '' })
              }
            >
              <PlusCircle className="mr-2 size-4" /> เพิ่มตัวเลือก
            </Button>
          </div>

          <FieldGroup className="space-y-4">
            {variantFields.map((item, index) => (
              <Card key={item.id} className="relative overflow-hidden">
                <CardContent className="grid grid-cols-1 gap-4 pt-6 md:grid-cols-4">
                  <Controller
                    name={`variants.${index}.title`}
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel className="text-xs">
                          ชื่อตัวเลือก (เช่น ไซส์ M / สีขาว)
                        </FieldLabel>
                        <Input {...field} aria-invalid={fieldState.invalid} />
                        {fieldState.invalid && (
                          <FieldError errors={[fieldState.error]} />
                        )}
                      </Field>
                    )}
                  />
                  <Controller
                    name={`variants.${index}.price`}
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel className="text-xs">ราคา</FieldLabel>
                        <Input
                          {...field}
                          type="number"
                          onChange={(e) =>
                            field.onChange(Number(e.target.value))
                          }
                          aria-invalid={fieldState.invalid}
                        />
                        {fieldState.invalid && (
                          <FieldError errors={[fieldState.error]} />
                        )}
                      </Field>
                    )}
                  />
                  <Controller
                    name={`variants.${index}.stock`}
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel className="text-xs">สต็อก</FieldLabel>
                        <Input
                          {...field}
                          type="number"
                          onChange={(e) =>
                            field.onChange(Number(e.target.value))
                          }
                          aria-invalid={fieldState.invalid}
                        />
                        {fieldState.invalid && (
                          <FieldError errors={[fieldState.error]} />
                        )}
                      </Field>
                    )}
                  />
                  <div className="flex items-end pb-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="text-destructive"
                      onClick={() => removeVariant(index)}
                      disabled={variantFields.length === 1}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </FieldGroup>
        </FieldSet>

        <FieldSet className="bg-muted/30 rounded-lg border p-4">
          <div className="mb-4 flex items-center justify-between">
            <FieldLegend className="text-lg font-bold">
              Metadata (ข้อมูลทางเทคนิค)
            </FieldLegend>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => appendMetadata({ key: '', value: '' })}
            >
              <CirclePlus className="mr-1 h-4 w-4" /> เพิ่มฟิลด์
            </Button>
          </div>

          <div className="space-y-3">
            {metadataFields.map((field, index) => (
              <div key={field.id} className="flex items-start gap-2">
                <Controller
                  name={`metadataFields.${index}.key`}
                  control={form.control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      placeholder="ชื่อฟิลด์ (เช่น material)"
                      className="w-1/3"
                    />
                  )}
                />
                <Controller
                  name={`metadataFields.${index}.value`}
                  control={form.control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      placeholder="ค่าข้อมูล"
                      className="flex-1"
                    />
                  )}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeMetadata(index)}
                >
                  <Trash2 className="text-destructive h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>

          <div className="mt-4">
            <Controller
              name="tags"
              control={form.control}
              render={({ field }) => (
                <Field>
                  <FieldLabel>Tags (คั่นด้วยเครื่องหมายคอมม่า)</FieldLabel>
                  <Input {...field} placeholder="เสื้อผ้า, แฟชั่น, cotton" />
                </Field>
              )}
            />
          </div>
        </FieldSet>

        <FieldSet className="bg-muted/30 rounded-xl border p-6">
          <div className="mb-4 flex items-center justify-between">
            <FieldLegend variant="label" className="text-lg font-semibold">
              บริการเสริม (Addons)
            </FieldLegend>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() =>
                appendAddon({ title: '', price: 0, isAvailable: true })
              }
            >
              <PlusCircle className="mr-2 size-4" /> เพิ่มบริการเสริม
            </Button>
          </div>

          <FieldGroup className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {addonFields.map((item, index) => (
              <Card key={item.id} className="border-blue-50 shadow-sm">
                <CardContent className="flex items-end gap-3 pt-6">
                  <div className="grid flex-1 grid-cols-2 gap-3">
                    <Controller
                      name={`addons.${index}.title`}
                      control={form.control}
                      render={({ field }) => (
                        <Field>
                          <FieldLabel className="text-xs">
                            ชื่อบริการ (เช่น ห่อของขวัญ)
                          </FieldLabel>
                          <Input {...field} />
                        </Field>
                      )}
                    />
                    <Controller
                      name={`addons.${index}.price`}
                      control={form.control}
                      render={({ field }) => (
                        <Field>
                          <FieldLabel className="text-xs">ราคาเพิ่ม</FieldLabel>
                          <Input
                            {...field}
                            type="number"
                            onChange={(e) =>
                              field.onChange(Number(e.target.value))
                            }
                          />
                        </Field>
                      )}
                    />
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="text-destructive hover:bg-destructive/10"
                    onClick={() => removeAddon(index)}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </CardContent>
              </Card>
            ))}
            {addonFields.length === 0 && (
              <div className="text-muted-foreground rounded-lg border-2 border-dashed py-6 text-center md:col-span-2">
                ยังไม่มีบริการเสริม
              </div>
            )}
          </FieldGroup>
        </FieldSet>

        <div className="flex justify-end gap-4 border-t pt-6">
          <Button type="button" variant="ghost" onClick={() => form.reset()}>
            ล้างฟอร์ม
          </Button>
          <Button type="button" variant="outline" onClick={aiGen}>
            <IconImageGeneration className="mr-2 size-4" />
            ให้ AI ช่วยคิดเนื้อหา
          </Button>
          <Button type="submit">บันทึกสินค้าใหม่</Button>
        </div>
      </form>

      <div className="sticky top-6 space-y-6 lg:col-span-1">
        <ProductPreviewContent form={form} />
      </div>
    </div>
  )
}

function ProductPreviewContent({ form }) {
  const title = form.watch('title') || 'ชื่อสินค้าจะแสดงตรงนี้'
  const slug = form.watch('slug') || 'url-slug-example'
  const tags = form.watch('tags')

  return (
    <div className="space-y-6">
      <div className="rounded-lg border bg-white p-4 shadow-sm">
        <p className="mb-2 text-xs font-semibold text-slate-400 uppercase">
          Google Search
        </p>
        <div className="space-y-1">
          <p className="text-sm text-emerald-700">
            https://yourstore.com › products › {slug}
          </p>
          <p className="cursor-pointer text-xl text-blue-700 hover:underline">
            {title}
          </p>
          <p className="line-clamp-2 text-sm text-slate-600">
            {tags ? `${tags} - ` : ''}สั่งซื้อ {title}{' '}
            พร้อมโปรโมชั่นพิเศษและตัวเลือกเสริมมากมายได้ที่นี่...
          </p>
        </div>
      </div>

      <div className="overflow-hidden rounded-lg border bg-white shadow-sm">
        <p className="border-b p-3 text-xs font-semibold text-slate-400 uppercase">
          Social Share
        </p>
        <div className="flex aspect-video items-center justify-center bg-slate-100 text-slate-400">
          Image Preview
        </div>
        <div className="bg-[#f2f3f5] p-3">
          <p className="text-[12px] text-slate-500 uppercase">YOURSTORE.COM</p>
          <p className="font-bold text-slate-800">{title}</p>
          <p className="line-clamp-1 text-sm text-slate-600">
            {tags ? `${tags} - ` : ''}สั่งซื้อ {title}{' '}
            พร้อมโปรโมชั่นพิเศษและตัวเลือกเสริมมากมายได้ที่นี่...
          </p>
        </div>
      </div>
    </div>
  )
}
