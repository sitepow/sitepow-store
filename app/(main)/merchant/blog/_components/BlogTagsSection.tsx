'use client'

import { useFormContext } from 'react-hook-form'
import { useTranslations } from 'next-intl'
import { IconWand } from '@tabler/icons-react'

import { Button } from '@/components/ui/button'
import { Field, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Spinner } from '@/components/ui/spinner'
import { AiGenTask } from '@/types/ai'
import { BlogFormValues } from '@/zod/blog'

interface BlogTagsSectionProps {
  isPending: boolean
  isGenAi: boolean
  onAiTrigger: (task: AiGenTask, action: () => void) => void
  onGenAi: (task: AiGenTask) => void
}

export function BlogTagsSection({
  isPending,
  isGenAi,
  onAiTrigger,
  onGenAi,
}: BlogTagsSectionProps) {
  const t = useTranslations('merchant.blog.form')
  const { register } = useFormContext<BlogFormValues>()

  return (
    <Field>
      <FieldLabel>{t('tags')}</FieldLabel>
      <div className="flex gap-2">
        <Input placeholder={t('tagsPlaceholder')} {...register('tags')} />
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={() =>
            onAiTrigger(AiGenTask.TAGS, () => onGenAi(AiGenTask.TAGS))
          }
          disabled={isPending}
        >
          {isGenAi ? <Spinner /> : <IconWand className="size-4" />}
        </Button>
      </div>
    </Field>
  )
}
