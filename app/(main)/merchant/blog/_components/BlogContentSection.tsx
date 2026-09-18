'use client'

import { Controller, useFormContext } from 'react-hook-form'
import { useTranslations } from 'next-intl'
import { IconWand } from '@tabler/icons-react'

import BlogEditor from '@/components/BlogEditor'
import { Button } from '@/components/ui/button'
import { Field, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Spinner } from '@/components/ui/spinner'
import { AiGenTask } from '@/types/ai'
import { BlogFormValues } from '@/zod/blog'

interface BlogContentSectionProps {
  isPending: boolean
  isGenAi: boolean
  onAiTrigger: (task: AiGenTask, action: () => void) => void
  onGenAi: (task: AiGenTask) => void
}

export function BlogContentSection({
  isPending,
  isGenAi,
  onAiTrigger,
  onGenAi,
}: BlogContentSectionProps) {
  const t = useTranslations('merchant.blog.form')
  const {
    control,
    register,
    formState: { errors },
  } = useFormContext<BlogFormValues>()

  return (
    <>
      <Field>
        <div className="mb-2 flex items-center justify-between">
          <FieldLabel>{t('content')}</FieldLabel>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() =>
              onAiTrigger(AiGenTask.ALL, () => onGenAi(AiGenTask.ALL))
            }
            disabled={isPending}
          >
            {isGenAi ? (
              <Spinner className="mr-2" />
            ) : (
              <IconWand className="mr-2 size-4" />
            )}
            {t('aiWriteContent')}
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
          <p className="text-destructive text-xs">{errors.content.message}</p>
        )}
      </Field>

      <div className="bg-muted/20 space-y-4 rounded-xl border p-4">
        <div className="text-muted-foreground flex items-center gap-2 text-sm font-medium">
          <span>🌐 คำแปลภาษาอังกฤษ (English Translation)</span>
        </div>
        <Field>
          <FieldLabel className="text-xs">Blog Title (EN)</FieldLabel>
          <Input
            placeholder="English Blog Title..."
            {...register('translations.en.title')}
            disabled={isPending}
          />
        </Field>
        <Field>
          <FieldLabel className="text-xs">Blog Content (EN)</FieldLabel>
          <Controller
            control={control}
            name="translations.en.content"
            render={({ field }) => (
              <BlogEditor
                value={field.value || ''}
                onChange={(markdown) => field.onChange(markdown)}
                locale="en"
              />
            )}
          />
        </Field>
      </div>
    </>
  )
}
