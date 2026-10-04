'use client'

import { useEffect, useState } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import toast from 'react-hot-toast'

import { handleUserPrompt } from '@/actions/ai/ai/actions'
import { useCategoryAi } from '@/actions/ai/ai/hooks'
import {
  useCategory,
  useCreateCategory,
  useUpdateCategory,
} from '@/actions/catalog/category/hooks'
import { useR2DeleteImage, useR2UploadImage } from '@/actions/shared/r2/hooks'
import { Plan } from '@/generated/prisma/enums'
import { useStoreData } from '@/stores/sites/use-store-data'
import { useStoreFilter } from '@/stores/use-store-filter'
import { buildCategoryPrompt } from '@/utils/ai/ai-helpers'
import { getPathR2FromUrl } from '@/utils/media/image'
import { formatSlug } from '@/utils/formatting/slug'
import { CreateCategoryFormValues, createCategorySchema } from '@/zod/catalog/category'
import { zodResolver } from '@hookform/resolvers/zod'
import { IconPlus, IconWand } from '@tabler/icons-react'

import { FileUpload } from '@/components/form/FileUpload'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
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

const DEFAULT_VALUES = { title: '', slug: '', description: '', image: '' }

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
  const { store } = useStoreData()
  const { selectedStoreId } = useStoreFilter()
  const createMutation = useCreateCategory()
  const updateMutation = useUpdateCategory()
  const uploadMutation = useR2UploadImage(`store/${selectedStoreId}/category`)
  const deleteMutation = useR2DeleteImage()

  const [aiConfirm, setAiConfirm] = useState<{
    cost: number
    action: () => void
  } | null>(null)

  const { data: categoryData } = useCategory(categoryId!)

  const methods = useForm<CreateCategoryFormValues>({
    resolver: zodResolver(createCategorySchema),
    defaultValues: DEFAULT_VALUES,
  })

  const {
    register,
    handleSubmit,
    reset,
    getValues,
    setError,
    formState: { errors },
  } = methods

  const { mutate: genCategoryAi, isPending: isGenAi } = useCategoryAi(
    methods,
    selectedStoreId!,
  )

  useEffect(() => {
    if (categoryData) {
      reset({
        ...categoryData,
        description: categoryData.description ?? '',
        image: categoryData.image ?? '',
      })
    } else {
      reset(DEFAULT_VALUES)
    }
  }, [categoryData, reset])

  const handleClose = () => {
    reset()
    setOpen(false)
  }

  const handleAiTrigger = async () => {
    const storePlan = store?.plan || Plan.FREE
    const currentTitle = getValues('title')

    if (!currentTitle || currentTitle.trim().length === 0) {
      setError('title', {
        message: 'กรุณากรอกชื่อหมวดหมู่ก่อนให้ AI ช่วยคิดครับ',
      })
      return
    }

    const currentDescription = getValues('description')
    const prompt = buildCategoryPrompt(currentTitle, currentDescription)

    const costEstimate = await handleUserPrompt(prompt, storePlan)

    setAiConfirm({
      cost: costEstimate.credits,
      action: () => genCategoryAi(),
    })
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
    deleteMutation.isPending ||
    isGenAi

  return (
    <>
      <Dialog
        open={open}
        onOpenChange={(v) => (!v ? handleClose() : setOpen(v))}
      >
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
                <FieldLabel>
                  รูปภาพหมวดหมู่ (รองรับรูปภาพและวิดีโอ ขนาดไฟล์สูงสุด 10 MB)
                </FieldLabel>
                <FileUpload name="image" />
              </Field>
              <Field>
                <div className="flex items-center justify-between">
                  <FieldLabel>ชื่อหมวดหมู่</FieldLabel>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleAiTrigger}
                    disabled={isPending}
                  >
                    {isGenAi ? (
                      <Spinner className="mr-1 size-3.5" />
                    ) : (
                      <IconWand className="mr-1 size-3.5" />
                    )}
                    ให้ AI ช่วยคิด Slug & คำอธิบาย
                  </Button>
                </div>
                <Input
                  placeholder="เช่น เสื้อผ้า, รองเท้า, อุปกรณ์อิเล็กทรอนิกส์"
                  {...register('title')}
                  disabled={isPending}
                />
                <FieldError>{errors?.title?.message}</FieldError>
              </Field>
              <Field>
                <FieldLabel>URL Slug</FieldLabel>
                <Input
                  placeholder="เช่น clothing, shoes"
                  {...register('slug')}
                  disabled={isPending}
                />
                <FieldError>{errors?.slug?.message}</FieldError>
              </Field>
              <Field>
                <FieldLabel>คำอธิบาย</FieldLabel>
                <Textarea
                  placeholder="อธิบายสั้นๆ เกี่ยวกับหมวดหมู่นี้"
                  rows={3}
                  {...register('description')}
                  disabled={isPending}
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
      <AlertDialog open={!!aiConfirm} onOpenChange={() => setAiConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              ยืนยันการใช้ AI คิดข้อมูลหมวดหมู่
            </AlertDialogTitle>
            <AlertDialogDescription>
              การดำเนินการนี้จะใช้เครดิตประมาณ{' '}
              <span className="text-primary font-bold">
                {aiConfirm?.cost} เครดิต
              </span>{' '}
              คุณต้องการดำเนินการต่อหรือไม่?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>ยกเลิก</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (aiConfirm) {
                  aiConfirm.action()
                  setAiConfirm(null)
                }
              }}
            >
              ยืนยัน
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
