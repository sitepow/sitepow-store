'use client'

import { useEffect, useRef, useState } from 'react'
import { Controller, FormProvider, useForm } from 'react-hook-form'
import toast from 'react-hot-toast'

import Image from 'next/image'
import { useRouter } from 'next/navigation'

import { handleUserPrompt } from '@/actions/ai/ai/actions'
import { useBlogAi } from '@/actions/ai/ai/hooks'
import { useBlog, useCreateBlog, useUpdateBlog } from '@/actions/catalog/blog/hooks'
import { useR2DeleteImage, useR2UploadImage } from '@/actions/shared/r2/hooks'
import { Plan } from '@/generated/prisma/enums'
import { useStoreData } from '@/stores/sites/use-store-data'
import { ALL_STORES, useStoreFilter } from '@/stores/use-store-filter'
import { AiGenTask } from '@/types/ai'
import { buildBlogPrompt } from '@/utils/ai/ai-helpers'
import { getPathR2FromUrl } from '@/utils/media/image'
import { BlogFormValues, blogFormSchema } from '@/zod/catalog/blog'
import { zodResolver } from '@hookform/resolvers/zod'
import { IconTrash, IconUpload, IconWand, IconX } from '@tabler/icons-react'

import BlogEditor from '@/components/editor/BlogEditor'
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
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Field, FieldGroup, FieldLabel, FieldSet } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Spinner } from '@/components/ui/spinner'

import { BlogPreviewContent } from './BlogPreviewDialog'

const fileToBase64 = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = (error) => reject(error)
  })

const dataURLtoFile = (dataurl: string, filename: string): File => {
  const arr = dataurl.split(',')
  const mimeMatch = arr[0].match(/:(.*?);/)
  const mime = mimeMatch ? mimeMatch[1] : 'image/png'
  const bstr = atob(arr[1])
  let n = bstr.length
  const u8arr = new Uint8Array(n)
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n)
  }
  return new File([u8arr], filename, { type: mime })
}

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

  const DRAFT_KEY = `blog_form_draft_${blogId || 'new'}`
  const isRestoredRef = useRef(false)

  const { data: blog, isLoading: isBlogLoading } = useBlog(blogId ?? '')
  const { mutateAsync: createBlogAsync, isPending: isCreating } =
    useCreateBlog()
  const { mutateAsync: updateBlogAsync, isPending: isUpdating } =
    useUpdateBlog()

  const uploadMutation = useR2UploadImage(`store/${selectedStoreId}/blogs`)
  const deleteMutation = useR2DeleteImage()

  const defaultFormValues: BlogFormValues = {
    title: '',
    slug: '',
    image: '',
    content: '',
    tags: '',
  }

  const form = useForm<BlogFormValues>({
    resolver: zodResolver(blogFormSchema),
    defaultValues: defaultFormValues,
  })

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    getValues,
    control,
    formState: { isDirty, errors },
  } = form

  const { mutate: genAi, isPending: isGenAi } = useBlogAi(
    form,
    selectedStoreId!,
  )

  const handleAiTrigger = async (task: AiGenTask, action: () => void) => {
    const storePlan = store?.plan || Plan.FREE
    const currentTitle = getValues('title')
    const currentContent = getValues('content')

    const prompt = buildBlogPrompt(task, currentTitle, currentContent)
    const costEstimate = await handleUserPrompt(prompt, storePlan)

    setAiTaskConfirm({
      task,
      cost: costEstimate.credits,
      action,
    })
  }

  useEffect(() => {
    const savedDraft = localStorage.getItem(DRAFT_KEY)
    if (savedDraft) {
      try {
        const parsedDraft = JSON.parse(savedDraft)

        if (parsedDraft?.imageBase64 && parsedDraft?.imageFileName) {
          const restoredFile = dataURLtoFile(
            parsedDraft.imageBase64,
            parsedDraft.imageFileName,
          )
          parsedDraft.image = restoredFile
        }

        reset(parsedDraft)
      } catch (e) {
        console.error(e)
      }
    }
    isRestoredRef.current = true
  }, [DRAFT_KEY, reset])

  useEffect(() => {
    const subscription = watch((value) => {
      if (!isRestoredRef.current) {
        return
      }

      const timer = setTimeout(async () => {
        try {
          const serializableValues = JSON.parse(
            JSON.stringify(value, (key, val) =>
              val instanceof File ? undefined : val,
            ),
          )

          const rawImage = value.image
          if (rawImage instanceof File) {
            const base64 = await fileToBase64(rawImage)
            serializableValues.imageBase64 = base64
            serializableValues.imageFileName = rawImage.name
            serializableValues.image = undefined
          } else if (typeof rawImage === 'string') {
            serializableValues.image = rawImage
          }

          localStorage.setItem(DRAFT_KEY, JSON.stringify(serializableValues))
        } catch (err) {
          console.error(err)
        }
      }, 600)

      return () => clearTimeout(timer)
    })

    return () => subscription.unsubscribe()
  }, [watch, DRAFT_KEY])

  const coverImageValue = watch('image')
  const previewImageUrl =
    coverImageValue instanceof File
      ? URL.createObjectURL(coverImageValue)
      : typeof coverImageValue === 'string'
        ? coverImageValue
        : ''

  const watchedValues = watch(['title', 'content', 'image'])
  useEffect(() => {
    if (onDataChange) {
      onDataChange({
        title: watchedValues[0] || '',
        content: watchedValues[1] || '',
        coverImage: previewImageUrl,
      })
    }
  }, [watchedValues, previewImageUrl, onDataChange])

  useEffect(() => {
    if (blog) {
      reset({
        title: blog.title,
        slug: blog.slug,
        image: blog.image || '',
        content: blog.content || '',
        tags: blog.tags?.join(', ') || '',
      })
    }
  }, [blog, reset])

  const handleResetForm = () => {
    localStorage.removeItem(DRAFT_KEY)
    reset(defaultFormValues)
    toast.success('ล้างข้อมูลร่างบทความเรียบร้อยแล้ว')
  }

  const isPending =
    isCreating ||
    isUpdating ||
    isBlogLoading ||
    uploadMutation.isPending ||
    deleteMutation.isPending ||
    isGenAi

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
      let finalImageUrl = typeof data.image === 'string' ? data.image : ''

      if (data.image instanceof File) {
        const formData = new FormData()
        formData.append('file', data.image)
        const res = await uploadMutation.mutateAsync(formData)
        if (res.success && res.url) {
          finalImageUrl = res.url
        }
      }

      if (blog?.image && blog.image !== finalImageUrl) {
        const oldImagePath = getPathR2FromUrl(blog.image)
        if (oldImagePath) {
          await deleteMutation.mutateAsync(oldImagePath)
        }
      }

      const tagsArray = data.tags
        ? data.tags
            .split(',')
            .map((t) => t.trim())
            .filter(Boolean)
        : []

      const payload = {
        storeId: selectedStoreId,
        title: data.title,
        slug: data.slug,
        image: finalImageUrl,
        content: data.content || '',
        tags: tagsArray,
      }

      if (blogId) {
        const res = await updateBlogAsync({ id: blogId, data: payload })
        if (res.success) {
          localStorage.removeItem(DRAFT_KEY)
          router.push('/merchant/blog')
        }
      } else {
        const res = await createBlogAsync(payload)
        if (res.success) {
          localStorage.removeItem(DRAFT_KEY)
          router.push('/merchant/blog')
        }
      }
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <FormProvider {...form}>
      <Card className="mb-6">
        <CardContent className="flex flex-wrap items-center gap-2.5">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" disabled={isPending}>
                {isGenAi ? (
                  <Spinner className="mr-2" />
                ) : (
                  <IconWand className="mr-2 size-4" />
                )}
                เครื่องมือ AI ช่วยเขียน
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>สร้างเนื้อหาด้วย AI</DropdownMenuLabel>
              <DropdownMenuItem
                onClick={() =>
                  handleAiTrigger(AiGenTask.ALL, () => genAi(AiGenTask.ALL))
                }
              >
                ให้ AI คิดเนื้อหาบทความทั้งหมด
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() =>
                  handleAiTrigger(AiGenTask.TITLE, () => genAi(AiGenTask.TITLE))
                }
              >
                สร้างชื่อบทความด้วย AI
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() =>
                  handleAiTrigger(AiGenTask.SLUG, () => genAi(AiGenTask.SLUG))
                }
              >
                สร้าง Slug จากชื่อบทความ
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() =>
                  handleAiTrigger(AiGenTask.TAGS, () => genAi(AiGenTask.TAGS))
                }
              >
                ให้ AI ช่วยคิด แท็ก (Tags)
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {isDirty && (
            <Button
              type="button"
              disabled={isPending}
              variant="outline"
              onClick={handleResetForm}
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
                <div className="flex gap-2">
                  <Input
                    placeholder="เช่น 10 เทคนิคการดูแลสุขภาพในปี 2026"
                    {...register('title')}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() =>
                      handleAiTrigger(AiGenTask.TITLE, () =>
                        genAi(AiGenTask.TITLE),
                      )
                    }
                    disabled={isPending}
                  >
                    {isGenAi ? <Spinner /> : <IconWand className="size-4" />}
                  </Button>
                </div>
                {errors.title && (
                  <p className="text-destructive text-xs">
                    {errors.title.message}
                  </p>
                )}
              </Field>
              <Field>
                <FieldLabel className="required">Slug (URL)</FieldLabel>
                <div className="flex gap-2">
                  <Input
                    placeholder="10-health-tips-2026"
                    {...register('slug')}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() =>
                      handleAiTrigger(AiGenTask.SLUG, () =>
                        genAi(AiGenTask.SLUG),
                      )
                    }
                    disabled={isPending}
                  >
                    {isGenAi ? <Spinner /> : <IconWand className="size-4" />}
                  </Button>
                </div>
                {errors.slug && (
                  <p className="text-destructive text-xs">
                    {errors.slug.message}
                  </p>
                )}
              </Field>
              <Field>
                <FieldLabel>รูปภาพปกบทความ</FieldLabel>
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
                          setValue('image', '', {
                            shouldDirty: true,
                            shouldValidate: true,
                          })
                        }
                      >
                        <IconTrash className="size-4" />
                      </Button>
                    </div>
                  ) : (
                    <label className="border-muted-foreground/25 hover:bg-muted/50 flex h-44 w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-4 text-center transition-colors">
                      <IconUpload className="text-muted-foreground mb-2 size-8" />
                      <div className="text-sm">
                        <span>คลิกเพื่ออัปโหลด หรือลากไฟล์มาวาง</span>
                      </div>
                      <p className="text-muted-foreground mt-1 text-xs">
                        แนะนำสัดส่วน 16:9 (เช่น 1920x1080px หรือ 1280x720px
                        ขึ้นไป)
                      </p>
                      <p className="text-muted-foreground/70 text-[11px]">
                        รองรับไฟล์ PNG, JPG, WEBP
                      </p>
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
                <div className="mb-2 flex items-center justify-between">
                  <FieldLabel>เนื้อหาบทความ</FieldLabel>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      handleAiTrigger(AiGenTask.ALL, () => genAi(AiGenTask.ALL))
                    }
                    disabled={isPending}
                  >
                    {isGenAi ? (
                      <Spinner className="mr-2" />
                    ) : (
                      <IconWand className="mr-2 size-4" />
                    )}
                    ให้ AI เขียนเนื้อหาให้
                  </Button>
                </div>
                <Controller
                  control={control}
                  name="content"
                  render={({ field }) => (
                    <BlogEditor
                      value={field.value}
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
              <Field>
                <FieldLabel>แท็ก (คั่นด้วยเครื่องหมายจุลภาค ,)</FieldLabel>
                <div className="flex gap-2">
                  <Input
                    placeholder="สุขภาพ, ไลฟ์สไตล์, ออกกำลังกาย"
                    {...register('tags')}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() =>
                      handleAiTrigger(AiGenTask.TAGS, () =>
                        genAi(AiGenTask.TAGS),
                      )
                    }
                    disabled={isPending}
                  >
                    {isGenAi ? <Spinner /> : <IconWand className="size-4" />}
                  </Button>
                </div>
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
              <span className="text-primary font-bold">
                {aiTaskConfirm?.cost} เครดิต
              </span>{' '}
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
