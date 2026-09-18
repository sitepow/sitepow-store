'use client'

import { useTranslations } from 'next-intl'
import {
  IconDeviceFloppy,
  IconExternalLink,
  IconRefresh,
  IconSparkles,
} from '@tabler/icons-react'

import BlogEditor from '@/components/BlogEditor'
import { PageTabHeader } from '@/components/PageTabHeader'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Spinner } from '@/components/ui/spinner'
import { TabsContent } from '@/components/ui/tabs'

import { PageItemConfig, PageKey } from '../_hooks/use-store-pages-form'

interface StoreMarkdownPageTabProps {
  page: PageItemConfig
  content: string
  editorKey: string
  pageUrl: string
  isPending: boolean
  generatingPageId: string | null
  isEstimatingAi: boolean
  locale: string
  onContentChange: (key: PageKey, value: string) => void
  onAiTrigger: (page: PageItemConfig) => void
  onResetTemplate: (page: PageItemConfig) => void
  onSavePage: (page: PageItemConfig) => void
}

export function StoreMarkdownPageTab({
  page,
  content,
  editorKey,
  pageUrl,
  isPending,
  generatingPageId,
  isEstimatingAi,
  locale,
  onContentChange,
  onAiTrigger,
  onResetTemplate,
  onSavePage,
}: StoreMarkdownPageTabProps) {
  const t = useTranslations('merchant.storePages')

  return (
    <TabsContent
      value={page.id}
      className="min-w-0 flex-1 focus-visible:outline-none"
    >
      <Card>
        <CardHeader>
          <PageTabHeader
            variant="secondary"
            icon={page.icon}
            title={
              <div className="flex flex-wrap items-center gap-2">
                <span>{page.label}</span>
                <a
                  href={pageUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-primary inline-flex items-center gap-1 text-xs font-normal hover:underline"
                  title={t('openInNewTab')}
                >
                  <span>{page.path}</span>
                  <IconExternalLink className="size-3.5 shrink-0" />
                </a>
              </div>
            }
            description={page.description}
            endContent={
              <div className="flex flex-wrap items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => onAiTrigger(page)}
                  disabled={
                    isPending ||
                    generatingPageId !== null ||
                    isEstimatingAi
                  }
                  className="text-primary border-primary/30 bg-primary/5 hover:bg-primary/10 cursor-pointer text-xs font-medium"
                  title={
                    locale === 'th'
                      ? 'ให้ AI ช่วยคิดเนื้อหาสำหรับหน้านี้'
                      : 'Generate content with AI'
                  }
                >
                  {generatingPageId === page.id ? (
                    <Spinner className="mr-1.5 size-3.5 shrink-0" />
                  ) : (
                    <IconSparkles className="text-primary mr-1.5 size-3.5 shrink-0" />
                  )}
                  {generatingPageId === page.id
                    ? locale === 'th'
                      ? 'AI กำลังคิดเนื้อหา...'
                      : 'Generating...'
                    : locale === 'th'
                      ? 'ให้ AI คิดเนื้อหาให้'
                      : 'AI Generate'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => onResetTemplate(page)}
                  disabled={isPending || generatingPageId !== null}
                  title={t('loadTemplateTooltip')}
                  className="cursor-pointer text-xs font-medium"
                >
                  <IconRefresh className="mr-1.5 size-3.5 shrink-0" />
                  {t('loadTemplate')}
                </Button>
                <Button
                  type="button"
                  size="sm"
                  onClick={() => onSavePage(page)}
                  disabled={isPending}
                  className="cursor-pointer text-xs font-medium"
                >
                  {isPending ? (
                    <Spinner className="mr-1.5 size-3.5 shrink-0" />
                  ) : (
                    <IconDeviceFloppy className="mr-1.5 size-3.5 shrink-0" />
                  )}
                  {isPending ? t('saving') : t('save')}
                </Button>
              </div>
            }
          />
        </CardHeader>
        <CardContent>
          <BlogEditor
            key={editorKey}
            value={content}
            onChange={(val) => onContentChange(page.key, val)}
          />
        </CardContent>
        <CardFooter className="flex flex-wrap items-center justify-between gap-3 border-t">
          <p className="text-muted-foreground text-xs">
            {t('markdownHint')}
          </p>
          <Button
            type="button"
            onClick={() => onSavePage(page)}
            disabled={isPending}
            className="cursor-pointer font-medium"
          >
            {isPending ? (
              <Spinner className="mr-1.5 size-4" />
            ) : (
              <IconDeviceFloppy className="mr-1.5 size-4" />
            )}
            {isPending ? t('saving') : t('save')}
          </Button>
        </CardFooter>
      </Card>
    </TabsContent>
  )
}
