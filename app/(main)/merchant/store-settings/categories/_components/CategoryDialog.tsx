'use client'

import { useEffect, useState } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import toast from 'react-hot-toast'

import { useTranslations } from 'next-intl'

import { handleUserPrompt } from '@/actions/ai'
import { useCategoryAi } from '@/actions/hooks/ai'
import {
  useCategory,
  useCreateCategory,
  useUpdateCategory,
} from '@/actions/hooks/category'
import { useR2DeleteImage, useR2UploadImage } from '@/actions/hooks/r2'
import { Plan } from '@/generated/prisma/enums'
import { useStoreData } from '@/stores/sites/use-store-data'
import { useStoreFilter } from '@/stores/use-store-filter'
import { buildCategoryPrompt } from '@/utils/ai'
import { getPathR2FromUrl } from '@/utils/image'
import { formatSlug } from '@/utils/slug'
import { CreateCategoryFormValues, createCategorySchema } from '@/zod/category'
import { zodResolver } from '@hookform/resolvers/zod'
import { IconCategory, IconPlus, IconWand } from '@tabler/icons-react'

import { DialogHeaderIcon } from '@/components/DialogHeaderIcon'
import { FileUpload } from '@/components/FileUpload'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
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
  const t = useTranslations('merchant.categories')
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
        message: t('dialog.aiTitleRequired'),
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
        return toast.error(t('dialog.imageUploadError'))
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
          <Button onClick={onAdd}>
            <IconPlus />
            {t('addCategory')}
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <FormProvider {...methods}>
            <DialogHeader>
              <DialogHeaderIcon
                icon={IconCategory}
                title={
                  categoryId ? t('dialog.editTitle') : t('dialog.createTitle')
                }
                description={t('dialog.description')}
              />
            </DialogHeader>
            <div className="grid gap-4">
              <Field>
                <FieldLabel>{t('dialog.imageLabel')}</FieldLabel>
                <FileUpload name="image" />
              </Field>
              <Field>
                <div className="flex items-center justify-between">
                  <FieldLabel>{t('dialog.titleLabel')}</FieldLabel>
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
                    {t('dialog.aiButton')}
                  </Button>
                </div>
                <Input
                  placeholder={t('dialog.titlePlaceholder')}
                  {...register('title')}
                  disabled={isPending}
                />
                <FieldError>{errors?.title?.message}</FieldError>
              </Field>
              <Field>
                <FieldLabel>{t('dialog.slugLabel')}</FieldLabel>
                <Input
                  placeholder={t('dialog.slugPlaceholder')}
                  {...register('slug')}
                  disabled={isPending}
                />
                <FieldError>{errors?.slug?.message}</FieldError>
              </Field>
              <Field>
                <FieldLabel>{t('dialog.descriptionLabel')}</FieldLabel>
                <Textarea
                  placeholder={t('dialog.descriptionPlaceholder')}
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
                {t('dialog.cancel')}
              </Button>
              <Button onClick={handleSubmit(onSubmit)} disabled={isPending}>
                {isPending ? (
                  <>
                    <Spinner /> {t('dialog.saving')}
                  </>
                ) : (
                  t('dialog.save')
                )}
              </Button>
            </DialogFooter>
          </FormProvider>
        </DialogContent>
      </Dialog>
      <AlertDialog open={!!aiConfirm} onOpenChange={() => setAiConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('dialog.aiConfirmTitle')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t.rich('dialog.aiConfirmDescription', {
                cost: aiConfirm?.cost ?? 0,
                b: (chunks) => (
                  <span className="text-primary font-bold">{chunks}</span>
                ),
              })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('dialog.cancel')}</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (aiConfirm) {
                  aiConfirm.action()
                  setAiConfirm(null)
                }
              }}
            >
              {t('dialog.confirm')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
