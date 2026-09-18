'use client'

import { useFormContext } from 'react-hook-form'
import { useTranslations } from 'next-intl'
import Image from 'next/image'
import { IconTrash, IconUpload, IconWand } from '@tabler/icons-react'

import { Button } from '@/components/ui/button'
import { Field, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Spinner } from '@/components/ui/spinner'
import { AiGenTask } from '@/types/ai'
import { BlogFormValues } from '@/zod/blog'

interface BlogBasicFieldsSectionProps {
  isPending: boolean
  isGenAi: boolean
  previewImageUrl: string
  onAiTrigger: (task: AiGenTask, action: () => void) => void
  onGenAi: (task: AiGenTask) => void
  onImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  onRemoveImage: () => void
}

export function BlogBasicFieldsSection({
  isPending,
  isGenAi,
  previewImageUrl,
  onAiTrigger,
  onGenAi,
  onImageChange,
  onRemoveImage,
}: BlogBasicFieldsSectionProps) {
  const t = useTranslations('merchant.blog.form')
  const {
    register,
    formState: { errors },
  } = useFormContext<BlogFormValues>()

  return (
    <>
      <Field>
        <FieldLabel className="required">{t('title')}</FieldLabel>
        <div className="flex gap-2">
          <Input
            placeholder={t('titlePlaceholder')}
            {...register('title')}
          />
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() =>
              onAiTrigger(AiGenTask.TITLE, () => onGenAi(AiGenTask.TITLE))
            }
            disabled={isPending}
          >
            {isGenAi ? <Spinner /> : <IconWand className="size-4" />}
          </Button>
        </div>
        {errors.title && (
          <p className="text-destructive text-xs">{errors.title.message}</p>
        )}
      </Field>

      <Field>
        <FieldLabel className="required">{t('slug')}</FieldLabel>
        <div className="flex gap-2">
          <Input placeholder="10-health-tips-2026" {...register('slug')} />
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() =>
              onAiTrigger(AiGenTask.SLUG, () => onGenAi(AiGenTask.SLUG))
            }
            disabled={isPending}
          >
            {isGenAi ? <Spinner /> : <IconWand className="size-4" />}
          </Button>
        </div>
        {errors.slug && (
          <p className="text-destructive text-xs">{errors.slug.message}</p>
        )}
      </Field>

      <Field>
        <FieldLabel>{t('coverImage')}</FieldLabel>
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
                onClick={onRemoveImage}
              >
                <IconTrash className="size-4" />
              </Button>
            </div>
          ) : (
            <label className="border-muted-foreground/25 hover:bg-muted/50 flex h-44 w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-4 text-center transition-colors">
              <IconUpload className="text-muted-foreground mb-2 size-8" />
              <div className="text-sm">
                <span>{t('uploadText')}</span>
              </div>
              <p className="text-muted-foreground mt-1 text-xs">
                {t('uploadRecommendation')}
              </p>
              <p className="text-muted-foreground/70 text-[11px]">
                {t('uploadFormats')}
              </p>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={onImageChange}
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
    </>
  )
}
