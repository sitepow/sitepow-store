'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'

import { useCreateCategory } from '@/actions/hooks/category'
import { useStoreFilter } from '@/stores/use-store-filter'
import { formatSlug } from '@/utils/slug'
import { CreateCategoryFormValues, createCategorySchema } from '@/zod/category'
import { zodResolver } from '@hookform/resolvers/zod'
import { IconPlus } from '@tabler/icons-react'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Field, FieldError, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Spinner } from '@/components/ui/spinner'
import { Textarea } from '@/components/ui/textarea'

export function CategoryCreateDialog() {
  const { selectedStoreId } = useStoreFilter()
  const [open, setOpen] = useState(false)
  const createCategoryMutation = useCreateCategory()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateCategoryFormValues>({
    resolver: zodResolver(createCategorySchema),
    defaultValues: {
      title: '',
      slug: '',
      description: '',
      image: '',
    },
  })

  const handleClose = () => {
    reset()
    setOpen(false)
  }

  const onSubmit = (values: CreateCategoryFormValues) => {
    createCategoryMutation.mutate(
      {
        ...values,
        slug: formatSlug(values.slug),
        storeId: selectedStoreId,
      },
      {
        onSuccess: () => {
          handleClose()
        },
      },
    )
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) {
          handleClose()
        } else {
          setOpen(v)
        }
      }}
    >
      <DialogTrigger asChild>
        <Button>
          เพิ่มหมวดหมู่ใหม่
          <IconPlus />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>เพิ่มหมวดหมู่ใหม่</DialogTitle>
          <DialogDescription>
            กรอกข้อมูลหมวดหมู่สินค้าสำหรับจัดระเบียบสินค้าในร้านค้าของคุณ
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4">
          <Field>
            <FieldLabel>ชื่อหมวดหมู่</FieldLabel>
            <Input
              placeholder="เช่น เสื้อผ้า, รองเท้า, อุปกรณ์อิเล็กทรอนิกส์"
              {...register('title')}
              disabled={createCategoryMutation.isPending}
            />
            <FieldError>{errors?.title?.message}</FieldError>
          </Field>

          <Field>
            <FieldLabel>URL Slug</FieldLabel>
            <Input
              placeholder="เช่น clothing, shoes"
              {...register('slug')}
              disabled={createCategoryMutation.isPending}
            />
            <FieldError>{errors?.slug?.message}</FieldError>
          </Field>

          <Field>
            <FieldLabel>คำอธิบาย</FieldLabel>
            <Textarea
              placeholder="อธิบายสั้นๆ เกี่ยวกับหมวดหมู่นี้"
              rows={3}
              {...register('description')}
              disabled={createCategoryMutation.isPending}
            />
            <FieldError>{errors?.description?.message}</FieldError>
          </Field>
        </div>

        <DialogFooter className="mt-2 flex gap-2 border-t pt-4">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={createCategoryMutation.isPending}
          >
            ยกเลิก
          </Button>
          <Button
            onClick={handleSubmit(onSubmit)}
            disabled={createCategoryMutation.isPending}
          >
            {createCategoryMutation.isPending ? (
              <>
                <Spinner /> กำลังบันทึก...
              </>
            ) : (
              'บันทึกหมวดหมู่'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
