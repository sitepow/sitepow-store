'use client'

import { useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { useTranslations } from 'next-intl'
import { useRouter } from 'next/navigation'
import { zodResolver } from '@hookform/resolvers/zod'

import { handleUserPrompt } from '@/actions/ai'
import { useBlogAi } from '@/actions/hooks/ai'
import { useBlog, useCreateBlog, useUpdateBlog } from '@/actions/hooks/blog'
import { useR2DeleteImage, useR2UploadImage } from '@/actions/hooks/r2'
import { Plan } from '@/generated/prisma/enums'
import { useCurrentStore } from '@/hooks/use-current-store'
import { ALL_STORES, useStoreFilter } from '@/stores/use-store-filter'
import { AiGenTask } from '@/types/ai'
import { buildBlogPrompt } from '@/utils/ai'
import { getPathR2FromUrl } from '@/utils/image'
import { BlogFormValues, blogFormSchema } from '@/zod/blog'

interface DraftBlogData {
  image?: string | File
  imageBase64?: string
  imageFileName?: string
  [key: string]: unknown
}

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

interface UseCreateBlogFormProps {
  blogId?: string
  onDataChange?: (data: {
    title: string
    content: string
    coverImage?: string
  }) => void
}

export function useCreateBlogForm({
  blogId,
  onDataChange,
}: UseCreateBlogFormProps) {
  const { currentStore, store } = useCurrentStore()
  const t = useTranslations('merchant.blog.form')
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

  // Restore draft from localStorage
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

  // Auto-save draft
  useEffect(() => {
    const subscription = watch((value) => {
      if (!isRestoredRef.current) {
        return
      }

      const timer = setTimeout(async () => {
        try {
          const serializableValues: DraftBlogData = JSON.parse(
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

  // Populate data when editing
  useEffect(() => {
    if (blog) {
      const blogWithTranslations = blog as {
        translations?: BlogFormValues['translations']
      }
      reset({
        title: blog.title,
        slug: blog.slug,
        image: blog.image || '',
        content: blog.content || '',
        tags: blog.tags?.join(', ') || '',
        translations: blogWithTranslations.translations ?? {
          en: { title: '', content: '' },
        },
      })
    }
  }, [blog, reset])

  const handleResetForm = () => {
    localStorage.removeItem(DRAFT_KEY)
    reset(defaultFormValues)
    toast.success(t('resetDraftSuccess'))
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

  const handleRemoveImage = () => {
    setValue('image', '', {
      shouldDirty: true,
      shouldValidate: true,
    })
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
            .map((item) => item.trim())
            .filter(Boolean)
        : []

      const payload = {
        storeId: selectedStoreId,
        title: data.title,
        slug: data.slug,
        image: finalImageUrl,
        content: data.content || '',
        tags: tagsArray,
        translations: data.translations ?? undefined,
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

  return {
    form,
    register,
    handleSubmit,
    setValue,
    watch,
    control,
    isDirty,
    errors,
    currentStore,
    store,
    isPending,
    isGenAi,
    aiTaskConfirm,
    setAiTaskConfirm,
    handleAiTrigger,
    genAi,
    handleResetForm,
    handleImageChange,
    handleRemoveImage,
    previewImageUrl,
    onSubmit,
    t,
  }
}
