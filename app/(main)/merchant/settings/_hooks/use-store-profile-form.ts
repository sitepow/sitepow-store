'use client'

import { useCallback, useEffect, useMemo, useRef } from 'react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { zodResolver } from '@hookform/resolvers/zod'

import { useStoreSeoAi } from '@/actions/hooks/ai'
import { useR2DeleteImage, useR2UploadImage } from '@/actions/hooks/r2'
import {
  useStoreProfile,
  useUpdateStoreProfile,
} from '@/actions/hooks/store-profile'
import { CurrencyCode } from '@/generated/prisma/enums'
import { useStoreFilter } from '@/stores/use-store-filter'
import { getPathR2FromUrl } from '@/utils/image'
import { StoreProfileFormValues, storeProfileSchema } from '@/zod/store-profile'

export function useStoreProfileForm() {
  const { selectedStoreId } = useStoreFilter()
  const { data: storeProfile } = useStoreProfile(selectedStoreId as string)
  const profileMutation = useUpdateStoreProfile()

  const uploadLogoMutation = useR2UploadImage(`store/${selectedStoreId}/logo`)
  const uploadBannerMutation = useR2UploadImage(
    `store/${selectedStoreId}/banner`,
  )
  const deleteMutation = useR2DeleteImage()

  const logoInputRef = useRef<HTMLInputElement>(null)
  const bannerInputRef = useRef<HTMLInputElement>(null)

  const form = useForm<StoreProfileFormValues>({
    resolver: zodResolver(storeProfileSchema),
    defaultValues: {
      name: '',
      slug: '',
      email: '',
      taxId: '',
      logo: '',
      coverImage: '',
      primaryColor: '',
      description: '',
      baseCurrency: CurrencyCode.THB,
      allowSearchEngineIndex: true,
      seoTitle: '',
      seoDescription: '',
      seoKeywords: '',
    },
  })

  const { reset, setValue, getValues, watch } = form

  const logo = watch('logo')
  const coverImage = watch('coverImage')

  const isVideo =
    (coverImage instanceof File && coverImage.type.startsWith('video/')) ||
    (typeof coverImage === 'string' && coverImage.match(/\.(mp4|webm|ogg)$/i))

  const previewLogoUrl = useMemo(() => {
    if (logo instanceof File) {
      return URL.createObjectURL(logo)
    }
    return typeof logo === 'string' ? logo : undefined
  }, [logo])

  useEffect(() => {
    return () => {
      if (previewLogoUrl?.startsWith('blob:')) {
        URL.revokeObjectURL(previewLogoUrl)
      }
    }
  }, [previewLogoUrl])

  const previewBannerUrl = useMemo(() => {
    if (coverImage instanceof File) {
      return URL.createObjectURL(coverImage)
    }
    return typeof coverImage === 'string' ? coverImage : undefined
  }, [coverImage])

  useEffect(() => {
    return () => {
      if (previewBannerUrl?.startsWith('blob:')) {
        URL.revokeObjectURL(previewBannerUrl)
      }
    }
  }, [previewBannerUrl])

  const resetForm = useCallback(() => {
    if (storeProfile) {
      reset({
        ...storeProfile,
        email: storeProfile.email ?? '',
        taxId: storeProfile.taxId ?? '',
        description: storeProfile.description ?? '',
        primaryColor: storeProfile.primaryColor ?? '',
        baseCurrency: (storeProfile as any).baseCurrency ?? CurrencyCode.THB,
        allowSearchEngineIndex: storeProfile.allowSearchEngineIndex ?? true,
        seoTitle: storeProfile.seoTitle ?? '',
        seoDescription: storeProfile.seoDescription ?? '',
        seoKeywords: storeProfile.seoKeywords ?? '',
      })
    }
  }, [storeProfile, reset])

  useEffect(() => {
    resetForm()
  }, [resetForm])

  const onSubmit = async (values: StoreProfileFormValues) => {
    let logoUrl = values.logo
    let bannerUrl = values.coverImage

    if (values.logo instanceof File) {
      if (storeProfile?.logo) {
        const oldKey = getPathR2FromUrl(storeProfile.logo)
        if (oldKey) {
          await deleteMutation.mutateAsync(oldKey)
        }
      }

      const res = await uploadLogoMutation.mutateAsync(values.logo)
      if (res?.success && res?.url) {
        logoUrl = res.url
      }
    }

    if (values.coverImage instanceof File) {
      if (storeProfile?.coverImage) {
        const oldKey = getPathR2FromUrl(storeProfile.coverImage)
        if (oldKey) {
          await deleteMutation.mutateAsync(oldKey)
        }
      }

      const res = await uploadBannerMutation.mutateAsync(values.coverImage)
      if (res?.success && res?.url) {
        bannerUrl = res.url
      }
    }

    profileMutation.mutate(
      {
        storeId: selectedStoreId as string,
        input: {
          ...values,
          logo: logoUrl,
          coverImage: bannerUrl,
        },
      },
      { onSuccess: () => reset(values) },
    )
  }

  const { mutateAsync: generateSeo, isPending: isGeneratingSeo } =
    useStoreSeoAi()

  const handleGenerateSeo = async () => {
    const storeName = getValues('name')
    if (!storeName || storeName.trim().length < 2) {
      toast.error(
        'กรุณาระบุชื่อร้านค้าอย่างน้อย 2 ตัวอักษร เพื่อให้ AI ช่วยคิด SEO',
      )
      return
    }

    const toastId = toast.loading('AI กำลังวิเคราะห์และคิดข้อมูล SEO ให้...')
    try {
      const storeDescription = getValues('description')
      const res = await generateSeo({
        storeName: storeName.trim(),
        storeDescription: storeDescription?.trim() || undefined,
        storeId: selectedStoreId as string,
      })

      if (res.success && res.data) {
        setValue('seoTitle', res.data.seoTitle, { shouldDirty: true })
        setValue('seoDescription', res.data.seoDescription, {
          shouldDirty: true,
        })
        setValue('seoKeywords', res.data.seoKeywords, { shouldDirty: true })
        toast.success(
          'AI คิดข้อมูล SEO ให้เรียบร้อยแล้ว คุณสามารถปรับแต่งเพิ่มเติมได้ตามต้องการ',
          { id: toastId },
        )
      } else {
        toast.error(
          res.messageTH || res.message || 'ไม่สามารถสร้างข้อมูล SEO ได้',
          { id: toastId },
        )
      }
    } catch {
      toast.error('เกิดข้อผิดพลาดในการเชื่อมต่อกับ AI', { id: toastId })
    }
  }

  const isPending =
    profileMutation.isPending ||
    uploadLogoMutation.isPending ||
    uploadBannerMutation.isPending ||
    deleteMutation.isPending ||
    isGeneratingSeo

  return {
    form,
    selectedStoreId,
    logoInputRef,
    bannerInputRef,
    logo,
    coverImage,
    isVideo,
    previewLogoUrl,
    previewBannerUrl,
    isPending,
    isGeneratingSeo,
    resetForm,
    onSubmit,
    handleGenerateSeo,
  }
}

