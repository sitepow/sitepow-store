'use client'

import { Controller, useFieldArray, useForm } from 'react-hook-form'

import { generateProductAiAction } from '@/actions/product'
import { productFormSchema } from '@/zod/product'
import { zodResolver } from '@hookform/resolvers/zod'
import { IconImageGeneration, IconLoader2 } from '@tabler/icons-react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { PlusCircle, Trash2 } from 'lucide-react'
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
  const queryClient = useQueryClient()

  const form = useForm<z.infer<typeof productFormSchema>>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      title: '',
      slug: '',
      categoryId: '',
      variants: [{ title: 'Standard', price: 0, stock: 0, sku: '' }],
      metadata: { brand: '', material: '' },
    },
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'variants',
  })

  const onSubmit = (data: z.infer<typeof productFormSchema>) => {
    console.log('Submitted Data:', data)
  }

  const aiGen = useMutation({
    mutationFn: async () => {
      const currentTitle = form.getValues('title')
      return await generateProductAiAction(currentTitle)
    },
    onSuccess: (data) => {
      form.reset({
        ...form.getValues(),
        ...data,
        variants: data.variants,
      })
    },
  })

  // const mutation = useMutation({
  //   mutationFn: createProductAction,
  //   onSuccess: () => {
  //     queryClient.invalidateQueries({ queryKey: ['products'] })
  //     alert('บันทึกสำเร็จ!')
  //     form.reset()
  //   },
  //   onError: (error) => {
  //     alert('เกิดข้อผิดพลาด: ' + error.message)
  //   },
  // })

  return (
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
                <FieldDescription>ชื่อที่จะแสดงบนหน้าร้านค้า</FieldDescription>
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
            onClick={() => append({ title: '', price: 0, stock: 0, sku: '' })}
          >
            <PlusCircle className="mr-2 size-4" /> เพิ่มตัวเลือก
          </Button>
        </div>

        <FieldGroup className="space-y-4">
          {fields.map((item, index) => (
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
                    onClick={() => remove(index)}
                    disabled={fields.length === 1}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </FieldGroup>
        {form.formState.errors.variants?.message && (
          <p className="text-destructive mt-2 text-sm">
            {form.formState.errors.variants.root?.message}
          </p>
        )}
      </FieldSet>

      <div className="flex justify-end gap-4 border-t pt-6">
        <Button type="button" variant="ghost" onClick={() => form.reset()}>
          ล้างฟอร์ม
        </Button>
        {/* <Button variant="outline">
          <IconImageGeneration className="mr-2 size-4" />
          ให้ AI ช่วยคิดเนื้อหา
        </Button> */}
        <Button
          type="button" // ต้องระบุเป็น button ไม่ให้มันไปสั่ง submit ฟอร์ม
          variant="outline"
          onClick={() => aiGen.mutate()}
          disabled={aiGen.isPending}
        >
          {aiGen.isPending ? (
            <IconLoader2 className="mr-2 size-4 animate-spin" />
          ) : (
            <IconImageGeneration className="mr-2 size-4" />
          )}
          ให้ AI ช่วยคิดเนื้อหา
        </Button>
        <Button type="submit">บันทึกสินค้าใหม่</Button>
      </div>
    </form>
  )
}
