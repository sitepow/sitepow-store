'use client'

import { useTranslations } from 'next-intl'
import { IconWand, IconX } from '@tabler/icons-react'

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
import { Spinner } from '@/components/ui/spinner'
import { AiGenTask } from '@/types/ai'

interface BlogFormHeaderProps {
  isPending: boolean
  isGenAi: boolean
  isDirty: boolean
  onAiTrigger: (task: AiGenTask, action: () => void) => void
  onGenAi: (task: AiGenTask) => void
  onResetForm: () => void
  onSubmit: () => void
}

export function BlogFormHeader({
  isPending,
  isGenAi,
  isDirty,
  onAiTrigger,
  onGenAi,
  onResetForm,
  onSubmit,
}: BlogFormHeaderProps) {
  const t = useTranslations('merchant.blog.form')

  return (
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
              {t('aiTool')}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>{t('aiGenerateLabel')}</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() =>
                onAiTrigger(AiGenTask.ALL, () => onGenAi(AiGenTask.ALL))
              }
            >
              {t('aiGenAll')}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() =>
                onAiTrigger(AiGenTask.TITLE, () => onGenAi(AiGenTask.TITLE))
              }
            >
              {t('aiGenTitle')}
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() =>
                onAiTrigger(AiGenTask.SLUG, () => onGenAi(AiGenTask.SLUG))
              }
            >
              {t('aiGenSlug')}
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() =>
                onAiTrigger(AiGenTask.TAGS, () => onGenAi(AiGenTask.TAGS))
              }
            >
              {t('aiGenTags')}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {isDirty && (
          <Button
            type="button"
            disabled={isPending}
            variant="outline"
            onClick={onResetForm}
          >
            <IconX className="mr-1 size-4" /> {t('resetChanges')}
          </Button>
        )}

        {isDirty && (
          <Button onClick={onSubmit} disabled={isPending}>
            {isPending && <Spinner className="mr-2" />}
            {t('saveBlog')}
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
