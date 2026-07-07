'use client'

import { useEffect } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import toast from 'react-hot-toast'

import {
  useCategory,
  useCreateCategory,
  useUpdateCategory,
} from '@/actions/hooks/category'
import { useR2DeleteImage, useR2UploadImage } from '@/actions/hooks/r2'
import { useStoreFilter } from '@/stores/use-store-filter'
import { getPathR2FromUrl } from '@/utils/image'
import { formatSlug } from '@/utils/slug'
import { CreateCategoryFormValues, createCategorySchema } from '@/zod/category'
import { zodResolver } from '@hookform/resolvers/zod'
import { IconPlus } from '@tabler/icons-react'

import { FileUpload } from '@/components/FileUpload'
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

const DEFALUT_VALUES = { title: '', slug: '', description: '', image: '' }

export function CategoryDialog({
  categoryId,
  open,
  setOpen,
  onAdd,
}: {
  categoryId?: string
  open: boolean
  setOpen: (v: boolean) => void
  onAdd?: () => void
}) {
  const { selectedStoreId } = useStoreFilter()
  const createMutation = useCreateCategory()
  const updateMutation = useUpdateCategory()
  const uploadMutation = useR2UploadImage(`store/${selectedStoreId}/category`)
  const deleteMutation = useR2DeleteImage()

  const createCategoryMutation = useCreateCategory()

  const { data: categoryData } = useCategory(categoryId!)

  const methods = useForm<CreateCategoryFormValues>({
    resolver: zodResolver(createCategorySchema),
    defaultValues: DEFALUT_VALUES,
  })

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = methods

  useEffect(() => {
    if (categoryData) {
      reset({
        ...categoryData,
        description: categoryData.description ?? '',
        image: categoryData.image ?? '',
      })
    } else {
      reset(DEFALUT_VALUES)
    }
  }, [categoryData, reset])

  const handleClose = () => {
    reset()
    setOpen(false)
  }

  const onSubmit = async (values: CreateCategoryFormValues) => {
    let imageUrl = values.image

    if (values.image === '' && categoryData?.image) {
      const oldKey = getPathR2FromUrl(categoryData.image)
      await deleteMutation.mutateAsync(oldKey)
      imageUrl = ''
    }

    if (values.image instanceof File) {
      if (categoryData?.image) {
        const oldKey = getPathR2FromUrl(categoryData.image)
        await deleteMutation.mutateAsync(oldKey)
      }

      const formData = new FormData()
      formData.append('file', values.image)
      const res = await uploadMutation.mutateAsync(formData)

      if (!res.success) {
        return toast.error('อัพโหลดรูปภาพไม่สำเร็จ')
      }

      imageUrl = res.url
    } else if (values.image === '' && categoryData?.image) {
      const oldKey = getPathR2FromUrl(categoryData.image)
      await deleteMutation.mutateAsync(oldKey)
      imageUrl = ''
    }

    const payload = {
      ...values,
      image: imageUrl,
      slug: formatSlug(values.slug),
      storeId: selectedStoreId,
    }

    if (categoryId) {
      updateMutation.mutate(
        { id: categoryId, input: payload },
        { onSuccess: handleClose },
      )
    } else {
      createMutation.mutate(payload, { onSuccess: handleClose })
    }
  }

  const isPending =
    createMutation.isPending ||
    updateMutation.isPending ||
    uploadMutation.isPending ||
    deleteMutation.isPending

  return (
    <Dialog open={open} onOpenChange={(v) => (!v ? handleClose() : setOpen(v))}>
      <DialogTrigger asChild>
        <Button variant="outline" onClick={onAdd}>
          <IconPlus />
          เพิ่มหมวดหมู่ใหม่
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <FormProvider {...methods}>
          <DialogHeader>
            <DialogTitle>
              {categoryId ? 'แก้ไขหมวดหมู่' : 'เพิ่มหมวดหมู่ใหม่'}
            </DialogTitle>
            <DialogDescription>
              กรอกข้อมูลหมวดหมู่สินค้าสำหรับจัดระเบียบสินค้าในร้านค้าของคุณ
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4">
            <Field>
              <FieldLabel>รูปภาพหมวดหมู่</FieldLabel>
              <FileUpload name="image" />
            </Field>
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
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={handleClose}
              disabled={isPending}
            >
              ยกเลิก
            </Button>
            <Button onClick={handleSubmit(onSubmit)} disabled={isPending}>
              {isPending ? (
                <>
                  <Spinner /> กำลังบันทึก...
                </>
              ) : (
                'บันทึกหมวดหมู่'
              )}
            </Button>
          </DialogFooter>
        </FormProvider>
      </DialogContent>
    </Dialog>
  )
}
