'use client'

import { useEffect, useState } from 'react'
import { Controller, FormProvider, useForm } from 'react-hook-form'

import Image from 'next/image'
import { useRouter } from 'next/navigation'

import { handleUserPrompt } from '@/actions/ai'
import { useR2DeleteImage, useR2UploadImage } from '@/actions/hooks/r2'
import { Plan } from '@/generated/prisma/enums'
import { useStoreData } from '@/stores/sites/use-store-data'
import { ALL_STORES, useStoreFilter } from '@/stores/use-store-filter'
import { AiGenTask } from '@/types/ai'
import { BlogFormValues, blogFormSchema } from '@/zod/blog'
import { zodResolver } from '@hookform/resolvers/zod'
import { IconTrash, IconUpload, IconWand, IconX } from '@tabler/icons-react'

import BlogEditor from '@/components/BlogEditor'
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
import { Card, CardContent } from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Field, FieldGroup, FieldLabel, FieldSet } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Spinner } from '@/components/ui/spinner'

import { BlogPreviewContent } from './BlogPreviewDialog'

interface CreateBlogFormProps {
  blogId?: string
  onDataChange?: (data: {
    title: string
    content: string
    coverImage?: string
  }) => void
}

export function CreateBlogForm({ blogId, onDataChange }: CreateBlogFormProps) {
  const { store } = useStoreData()
  const router = useRouter()
  const { selectedStoreId } = useStoreFilter()

  const [aiTaskConfirm, setAiTaskConfirm] = useState<{
    task: AiGenTask
    cost: number
    action: () => void
  } | null>(null)

  //   const { data: blog, isLoading: isBlogLoading } = useBlog(blogId ?? '')
  //   const { mutate: create, isPending: isCreating } = useCreateBlog()
  //   const { mutate: update, isPending: isUpdating } = useUpdateBlog()

  const uploadMutation = useR2UploadImage(`store/${selectedStoreId}/blogs`)
  const deleteMutation = useR2DeleteImage()

  const form = useForm<BlogFormValues>({
    resolver: zodResolver(blogFormSchema),
    defaultValues: {
      title: '',
      slug: '',
      image: '',
      content: '',
      tags: '',
    },
  })

  const {
    register,
    handleSubmit,
    reset,
    // getValues,
    setValue,
    watch,
    control,
    formState: { isDirty, errors },
  } = form

  const watchedValues = watch(['title', 'content', 'image'])
  useEffect(() => {
    if (onDataChange) {
      onDataChange({
        title: watchedValues[0],
        content: watchedValues[1],
        coverImage:
          typeof watchedValues[2] === 'string' ? watchedValues[2] : '',
      })
    }
  }, [watchedValues, onDataChange])

  //   useEffect(() => {
  //     if (blog) {
  //       reset({
  //         title: blog.title,
  //         slug: blog.slug,
  //         image: blog.image,
  //         content: blog.content,
  //         tags: blog.tags?.join(', ') || '',
  //       })
  //     }
  //   }, [blog, reset])

  const isPending =
    // isCreating ||
    // isUpdating ||
    // isBlogLoading ||
    uploadMutation.isPending || deleteMutation.isPending

  const handleAiTrigger = async (task: AiGenTask, action: () => void) => {
    const storePlan = store?.plan || Plan.FREE
    // const currentTitle = getValues('title')
    // const prompt = buildBlogPrompt(task, currentTitle)
    const costEstimate = await handleUserPrompt('prompt', storePlan)

    setAiTaskConfirm({
      task,
      cost: costEstimate.credits,
      action,
    })
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setValue('image', file, { shouldDirty: true, shouldValidate: true })
    }
  }

  const onSubmit = async (data: BlogFormValues) => {
    if (!selectedStoreId || selectedStoreId === ALL_STORES) {
      return
    }

    try {
      //   let finalImageUrl = typeof data.image === 'string' ? data.image : ''

      if (data.image instanceof File) {
        const formData = new FormData()
        formData.append('file', data.image)
        const res = await uploadMutation.mutateAsync(formData)
        if (res.success) {
          //   finalImageUrl = res.url
        }
      }

      //   if (blog?.image && blog.image !== finalImageUrl) {
      //     const path = getPathR2FromUrl(blog.image)
      //     if (path) {
      //       await deleteMutation.mutateAsync(path)
      //     }
      //   }

      //   const tagsArray = data.tags
      //     ? data.tags
      //         .split(',')
      //         .map((t) => t.trim())
      //         .filter(Boolean)
      //     : []

      //   const payload = {
      //     storeId: selectedStoreId,
      //     title: data.title,
      //     slug: data.slug,
      //     image: 'finalImageUrl',
      //     content: data.content,
      //     tags: tagsArray,
      //   }

      //   if (blogId) {
      //     update({ id: blogId, data: payload })
      //   } else {
      //     create(payload)
      //   }

      router.push('/merchant/blogs')
    } catch {}
  }

  const coverImageValue = watch('image')
  const previewImageUrl =
    coverImageValue instanceof File
      ? URL.createObjectURL(coverImageValue)
      : coverImageValue

  return (
    <FormProvider {...form}>
      <Card className="mb-6">
        <CardContent className="flex flex-wrap items-center gap-2.5 pt-6">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" disabled={isPending}>
                <IconWand className="mr-2 size-4" />
                เครื่องมือ AI ช่วยเขียน
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>สร้างเนื้อหาด้วย AI</DropdownMenuLabel>
              <DropdownMenuItem
                onClick={() => handleAiTrigger(AiGenTask.SLUG, () => {})}
              >
                สร้าง Slug จากชื่อบทความ
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          {isDirty && (
            <Button
              type="button"
              disabled={isPending}
              variant="outline"
              onClick={() => reset()}
            >
              <IconX className="mr-1 size-4" /> ล้างการเปลี่ยนแปลง
            </Button>
          )}
          {isDirty && (
            <Button onClick={handleSubmit(onSubmit)} disabled={isPending}>
              {isPending && <Spinner className="mr-2" />}
              บันทึกบทความ
            </Button>
          )}
        </CardContent>
      </Card>
      <div className="grid grid-cols-1 items-start gap-10 xl:grid-cols-2">
        <div className="space-y-8">
          <FieldSet disabled={isPending}>
            <FieldGroup className="grid gap-6">
              <Field>
                <FieldLabel className="required">ชื่อบทความ</FieldLabel>
                <Input
                  placeholder="เช่น 10 เทคนิคการดูแลสุขภาพในปี 2026"
                  {...register('title')}
                />
                {errors.title && (
                  <p className="text-destructive text-xs">
                    {errors.title.message}
                  </p>
                )}
              </Field>
              <Field>
                <FieldLabel className="required">Slug (URL)</FieldLabel>
                <Input
                  placeholder="10-health-tips-2026"
                  {...register('slug')}
                />
                {errors.slug && (
                  <p className="text-destructive text-xs">
                    {errors.slug.message}
                  </p>
                )}
              </Field>
              <Field>
                <FieldLabel>แท็ก (คั่นด้วยเครื่องหมายจุลภาค ,)</FieldLabel>
                <Input
                  placeholder="สุขภาพ, ไลฟ์สไตล์, ออกกำลังกาย"
                  {...register('tags')}
                />
              </Field>
              <Field>
                <FieldLabel className="required">รูปภาพปกบทความ</FieldLabel>
                <div className="space-y-3">
                  {previewImageUrl ? (
                    <div className="bg-muted relative aspect-video w-full overflow-hidden rounded-lg border">
                      <Image
                        src={previewImageUrl}
                        alt="Cover Preview"
                        fill
                        className="object-cover"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute top-2 right-2"
                        onClick={() =>
                          setValue('image', '', { shouldDirty: true })
                        }
                      >
                        <IconTrash className="size-4" />
                      </Button>
                    </div>
                  ) : (
                    <label className="border-muted-foreground/25 hover:bg-muted/50 flex h-44 w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed transition-colors">
                      <IconUpload className="text-muted-foreground mb-2 size-8" />
                      <span className="text-muted-foreground text-sm">
                        คลิกเพื่ออัปโหลดรูปภาพปก (16:9)
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleImageChange}
                      />
                    </label>
                  )}
                  {errors.image && (
                    <p className="text-destructive text-xs">
                      {String(errors.image.message)}
                    </p>
                  )}
                </div>
              </Field>
              <Field>
                <FieldLabel className="required">เนื้อหาบทความ</FieldLabel>
                <Controller
                  control={control}
                  name="content"
                  render={({ field }) => (
                    <BlogEditor
                      onChange={(markdown) => field.onChange(markdown)}
                    />
                  )}
                />
                {errors.content && (
                  <p className="text-destructive text-xs">
                    {errors.content.message}
                  </p>
                )}
              </Field>
            </FieldGroup>
          </FieldSet>
        </div>
        <div className="sticky top-6 space-y-6 xl:col-span-1">
          <BlogPreviewContent />
        </div>
      </div>
      <AlertDialog
        open={!!aiTaskConfirm}
        onOpenChange={() => setAiTaskConfirm(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>ยืนยันการใช้ AI</AlertDialogTitle>
            <AlertDialogDescription>
              การดำเนินการนี้จะใช้เครดิตประมาณ{' '}
              <span className="text-primary">{aiTaskConfirm?.cost} เครดิต</span>{' '}
              คุณต้องการดำเนินการต่อหรือไม่?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>ยกเลิก</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (aiTaskConfirm) {
                  aiTaskConfirm.action()
                  setAiTaskConfirm(null)
                }
              }}
            >
              ยืนยัน
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </FormProvider>
  )
}
